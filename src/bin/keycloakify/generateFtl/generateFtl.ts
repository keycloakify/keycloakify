import cheerio from "cheerio";
import { replaceImportsFromStaticInJsCode } from "../replacers/replaceImportsFromStaticInJsCode";
import { generateCssCodeToDefineGlobals } from "../replacers/replaceImportsInCssCode";
import { replaceImportsInInlineCssCode } from "../replacers/replaceImportsInInlineCssCode";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { objectKeys } from "tsafe/objectKeys";
import { ftlValuesGlobalName } from "../ftlValuesGlobalName";
import type { BuildOptions } from "../BuildOptions";
import { assert } from "tsafe/assert";

export const themeTypes = ["login", "account"] as const;

export type ThemeType = (typeof themeTypes)[number];

export type BuildOptionsLike = BuildOptionsLike.Standalone | BuildOptionsLike.ExternalAssets;

export namespace BuildOptionsLike {
    export type Common = {
        customUserAttributes: string[];
    };

    export type Standalone = Common & {
        isStandalone: true;
        urlPathname: string | undefined;
    };

    export type ExternalAssets = ExternalAssets.SameDomain | ExternalAssets.DifferentDomains;

    export namespace ExternalAssets {
        export type CommonExternalAssets = {
            isStandalone: false;
        };

        export type SameDomain = Common &
            CommonExternalAssets & {
                areAppAndKeycloakServerSharingSameDomain: true;
            };

        export type DifferentDomains = Common &
            CommonExternalAssets & {
                areAppAndKeycloakServerSharingSameDomain: false;
                urlOrigin: string;
                urlPathname: string | undefined;
            };
    }
}

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export function generateFtlFilesCodeFactory(params: {
    indexHtmlCode: string;
    //NOTE: Expected to be an empty object if external assets mode is enabled.
    cssGlobalsToDefine: Record<string, string>;
    buildOptions: BuildOptionsLike;
    keycloakifyVersion: string;
}) {
    const { cssGlobalsToDefine, indexHtmlCode, buildOptions, keycloakifyVersion } = params;

    const $ = cheerio.load(indexHtmlCode);

    fix_imports_statements: {
        if (!buildOptions.isStandalone && buildOptions.areAppAndKeycloakServerSharingSameDomain) {
            break fix_imports_statements;
        }

        $("script:not([src])").each((...[, element]) => {
            const { fixedJsCode } = replaceImportsFromStaticInJsCode({
                "jsCode": $(element).html()!,
                buildOptions
            });

            $(element).text(fixedJsCode);
        });

        $("style").each((...[, element]) => {
            const { fixedCssCode } = replaceImportsInInlineCssCode({
                "cssCode": $(element).html()!,
                buildOptions
            });

            $(element).text(fixedCssCode);
        });

        (
            [
                ["link", "href"],
                ["script", "src"]
            ] as const
        ).forEach(([selector, attrName]) =>
            $(selector).each((...[, element]) => {
                const href = $(element).attr(attrName);

                if (href === undefined) {
                    return;
                }

                $(element).attr(
                    attrName,
                    buildOptions.isStandalone
                        ? href.replace(new RegExp(`^${(buildOptions.urlPathname ?? "/").replace(/\//g, "\\/")}`), "${url.resourcesPath}/build/")
                        : href.replace(/^\//, `${buildOptions.urlOrigin}/`)
                );
            })
        );

        if (Object.keys(cssGlobalsToDefine).length !== 0) {
            $("head").prepend(
                [
                    "",
                    "<style>",
                    generateCssCodeToDefineGlobals({
                        cssGlobalsToDefine,
                        buildOptions
                    }).cssCodeToPrependInHead,
                    "</style>",
                    ""
                ].join("\n")
            );
        }
    }

    //FTL is no valid html, we can't insert with cheerio, we put placeholder for injecting later.
    const replaceValueBySearchValue = {
        '{ "x": "vIdLqMeOed9sdLdIdOxdK0d" }': fs
            .readFileSync(pathJoin(__dirname, "ftl_object_to_js_code_declaring_an_object.ftl"))
            .toString("utf8")
            .match(/^<script>const _=((?:.|\n)+)<\/script>[\n]?$/)![1]
            .replace(
                "CUSTOM_USER_ATTRIBUTES_eKsIY4ZsZ4xeM",
                buildOptions.customUserAttributes.length === 0 ? "" : ", " + buildOptions.customUserAttributes.map(name => `"${name}"`).join(", ")
            )
            .replace("KEYCLOAKIFY_VERSION_xEdKd3xEdr", keycloakifyVersion),
        "<!-- xIdLqMeOedErIdLsPdNdI9dSlxI -->": [
            "<#if scripts??>",
            "    <#list scripts as script>",
            '        <script src="${script}" type="text/javascript"></script>',
            "    </#list>",
            "</#if>"
        ].join("\n")
    };

    $("head").prepend(
        [
            "<script>",
            `    window.${ftlValuesGlobalName}= ${objectKeys(replaceValueBySearchValue)[0]};`,
            "</script>",
            "",
            objectKeys(replaceValueBySearchValue)[1]
        ].join("\n")
    );

    const partiallyFixedIndexHtmlCode = $.html();

    function generateFtlFilesCode(params: { pageId: string }): {
        ftlCode: string;
    } {
        const { pageId } = params;

        const $ = cheerio.load(partiallyFixedIndexHtmlCode);

        let ftlCode = $.html();

        Object.entries({
            ...replaceValueBySearchValue,
            "PAGE_ID_xIgLsPgGId9D8e": pageId
        }).map(([searchValue, replaceValue]) => (ftlCode = ftlCode.replace(searchValue, replaceValue)));

        return { ftlCode };
    }

    return { generateFtlFilesCode };
}
