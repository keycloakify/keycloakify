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
import { Reflect } from "tsafe/Reflect";

export const themeTypes = ["login", "account"] as const;

export type ThemeType = (typeof themeTypes)[number];

export const loginThemePageIds = [
    "login.ftl",
    "login-username.ftl",
    "login-password.ftl",
    "webauthn-authenticate.ftl",
    "register.ftl",
    "register-user-profile.ftl",
    "info.ftl",
    "error.ftl",
    "login-reset-password.ftl",
    "login-verify-email.ftl",
    "terms.ftl",
    "login-otp.ftl",
    "login-update-profile.ftl",
    "login-update-password.ftl",
    "login-idp-link-confirm.ftl",
    "login-idp-link-email.ftl",
    "login-page-expired.ftl",
    "login-config-totp.ftl",
    "logout-confirm.ftl",
    "update-user-profile.ftl",
    "idp-review-user-profile.ftl",
    "update-email.ftl"
] as const;

export const accountThemePageIds = ["password.ftl", "account.ftl"] as const;

export type LoginThemePageId = (typeof loginThemePageIds)[number];
export type AccountThemePageId = (typeof accountThemePageIds)[number];

export type BuildOptionsLike = BuildOptionsLike.Standalone | BuildOptionsLike.ExternalAssets;

export namespace BuildOptionsLike {
    export type Standalone = {
        isStandalone: true;
        urlPathname: string | undefined;
    };

    export type ExternalAssets = ExternalAssets.SameDomain | ExternalAssets.DifferentDomains;

    export namespace ExternalAssets {
        export type CommonExternalAssets = {
            isStandalone: false;
        };

        export type SameDomain = CommonExternalAssets & {
            areAppAndKeycloakServerSharingSameDomain: true;
        };

        export type DifferentDomains = CommonExternalAssets & {
            areAppAndKeycloakServerSharingSameDomain: false;
            urlOrigin: string;
            urlPathname: string | undefined;
        };
    }
}

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export function generateFtlFilesCodeFactory(params: {
    indexHtmlCode: string;
    //NOTE: Expected to be an empty object if external assets mode is enabled.
    cssGlobalsToDefine: Record<string, string>;
    buildOptions: BuildOptionsLike;
}) {
    const { cssGlobalsToDefine, indexHtmlCode, buildOptions } = params;

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
            .match(/^<script>const _=((?:.|\n)+)<\/script>[\n]?$/)![1],
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
            //If updated, don't forget to change in the ftl script as well.
            "PAGE_ID_xIgLsPgGId9D8e": pageId
        }).map(([searchValue, replaceValue]) => (ftlCode = ftlCode.replace(searchValue, replaceValue)));

        return { ftlCode };
    }

    return { generateFtlFilesCode };
}
