import cheerio from "cheerio";
import { replaceImportsInJsCode } from "../replacers/replaceImportsInJsCode";
import { replaceImportsInCssCode } from "../replacers/replaceImportsInCssCode";
import * as fs from "fs";
import { join as pathJoin } from "path";
import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import {
    type ThemeType,
    basenameOfTheKeycloakifyResourcesDir,
    resources_common
} from "../../shared/constants";
import { getThisCodebaseRootDirPath } from "../../tools/getThisCodebaseRootDirPath";

export type BuildContextLike = {
    bundler: "vite" | "webpack";
    themeVersion: string;
    urlPathname: string | undefined;
    projectBuildDirPath: string;
    assetsDirPath: string;
    kcContextExclusionsFtlCode: string | undefined;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function generateFtlFilesCodeFactory(params: {
    themeName: string;
    indexHtmlCode: string;
    buildContext: BuildContextLike;
    keycloakifyVersion: string;
    themeType: ThemeType;
    fieldNames: string[];
}) {
    const {
        themeName,
        indexHtmlCode,
        buildContext,
        keycloakifyVersion,
        themeType,
        fieldNames
    } = params;

    const $ = cheerio.load(indexHtmlCode);

    fix_imports_statements: {
        $("script:not([src])").each((...[, element]) => {
            const jsCode = $(element).html();

            assert(jsCode !== null);

            const { fixedJsCode } = replaceImportsInJsCode({
                jsCode,
                buildContext
            });

            $(element).text(fixedJsCode);
        });

        $("style").each((...[, element]) => {
            const cssCode = $(element).html();

            assert(cssCode !== null);

            const { fixedCssCode } = replaceImportsInCssCode({
                cssCode,
                cssFileRelativeDirPath: undefined,
                buildContext
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
                    href.replace(
                        new RegExp(
                            `^${(buildContext.urlPathname ?? "/").replace(/\//g, "\\/")}`
                        ),
                        `\${url.resourcesPath}/${basenameOfTheKeycloakifyResourcesDir}/`
                    )
                );
            })
        );
    }

    //FTL is no valid html, we can't insert with cheerio, we put placeholder for injecting later.
    const kcContextDeclarationTemplateFtl = fs
        .readFileSync(
            pathJoin(
                getThisCodebaseRootDirPath(),
                "src",
                "bin",
                "keycloakify",
                "generateFtl",
                "kcContextDeclarationTemplate.ftl"
            )
        )
        .toString("utf8")
        .replace(
            "FIELD_NAMES_eKsIY4ZsZ4xeM",
            fieldNames.map(name => `"${name}"`).join(", ")
        )
        .replace("KEYCLOAKIFY_VERSION_xEdKd3xEdr", keycloakifyVersion)
        .replace("KEYCLOAKIFY_THEME_VERSION_sIgKd3xEdr3dx", buildContext.themeVersion)
        .replace("KEYCLOAKIFY_THEME_TYPE_dExKd3xEdr", themeType)
        .replace("KEYCLOAKIFY_THEME_NAME_cXxKd3xEer", themeName)
        .replace("RESOURCES_COMMON_cLsLsMrtDkpVv", resources_common)
        .replace(
            "USER_DEFINED_EXCLUSIONS_eKsaY4ZsZ4eMr2",
            buildContext.kcContextExclusionsFtlCode ?? ""
        );
    const ftlObjectToJsCodeDeclaringAnObjectPlaceholder =
        '{ "x": "vIdLqMeOed9sdLdIdOxdK0d" }';

    $("head").prepend(
        `<script>\n${ftlObjectToJsCodeDeclaringAnObjectPlaceholder}\n</script>`
    );

    // Remove part of the document marked as ignored.
    {
        const startTags = $('meta[name="keycloakify-ignore-start"]');

        startTags.each((...[, startTag]) => {
            const $startTag = $(startTag);
            const $endTag = $startTag
                .nextAll('meta[name="keycloakify-ignore-end"]')
                .first();

            if ($endTag.length) {
                let currentNode = $startTag.next();
                while (currentNode.length && !currentNode.is($endTag)) {
                    currentNode.remove();
                    currentNode = $startTag.next();
                }

                $startTag.remove();
                $endTag.remove();
            }
        });
    }

    const partiallyFixedIndexHtmlCode = $.html();

    function generateFtlFilesCode(params: { pageId: string }): {
        ftlCode: string;
    } {
        const { pageId } = params;

        const $ = cheerio.load(partiallyFixedIndexHtmlCode);

        let ftlCode = $.html();

        Object.entries({
            [ftlObjectToJsCodeDeclaringAnObjectPlaceholder]:
                kcContextDeclarationTemplateFtl,
            PAGE_ID_xIgLsPgGId9D8e: pageId
        }).map(
            ([searchValue, replaceValue]) =>
                (ftlCode = ftlCode.replace(searchValue, replaceValue))
        );

        return { ftlCode };
    }

    return { generateFtlFilesCode };
}
