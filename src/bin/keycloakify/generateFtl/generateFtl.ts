import * as cheerio from "cheerio";
import {
    replaceImportsInJsCode,
    BuildContextLike as BuildContextLike_replaceImportsInJsCode
} from "../replacers/replaceImportsInJsCode";
import {
    replaceImportsInCssCode,
    BuildContextLike as BuildContextLike_replaceImportsInCssCode
} from "../replacers/replaceImportsInCssCode";
import * as fs from "fs";
import { join as pathJoin } from "path";
import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import {
    type ThemeType,
    WELL_KNOWN_DIRECTORY_BASE_NAME,
    KEYCLOAKIFY_SPA_DEV_SERVER_PORT
} from "../../shared/constants";
import { getThisCodebaseRootDirPath } from "../../tools/getThisCodebaseRootDirPath";

export type BuildContextLike = BuildContextLike_replaceImportsInJsCode &
    BuildContextLike_replaceImportsInCssCode & {
        urlPathname: string | undefined;
        themeVersion: string;
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
                ["script", "src"],
                ["script", "data-src"]
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
                        `\${xKeycloakify.resourcesPath}/${WELL_KNOWN_DIRECTORY_BASE_NAME.DIST}/`
                    )
                );
            })
        );
    }

    $("head base").remove();

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
        .replace("{{themeType}}", themeType)
        .replace("{{themeName}}", themeName)
        .replace("{{keycloakifyVersion}}", keycloakifyVersion)
        .replace("{{themeVersion}}", buildContext.themeVersion)
        .replace("{{fieldNames}}", fieldNames.map(name => `"${name}"`).join(", "))
        .replace("{{RESOURCES_COMMON}}", WELL_KNOWN_DIRECTORY_BASE_NAME.RESOURCES_COMMON)
        .replace("{{KEYCLOAKIFY_SPA_DEV_SERVER_PORT}}", KEYCLOAKIFY_SPA_DEV_SERVER_PORT)
        .replace(
            "{{userDefinedExclusions}}",
            buildContext.kcContextExclusionsFtlCode ?? ""
        );

    const ftlObjectToJsCodeDeclaringAnObjectPlaceholder =
        '{ "x": "vIdLqMeOed9sdLdIdOxdK0d" }';

    $("head").prepend(
        [
            `<script>\n${ftlObjectToJsCodeDeclaringAnObjectPlaceholder}\n</script>`,
            `<base href="\${xKeycloakify.resourcesPath}/${WELL_KNOWN_DIRECTORY_BASE_NAME.DIST}/" />`
        ].join("\n")
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
            "{{pageId}}": pageId,
            "{{ftlTemplateFileName}}": pageId
        }).map(
            ([searchValue, replaceValue]) =>
                (ftlCode = ftlCode.replace(searchValue, replaceValue))
        );

        return { ftlCode };
    }

    return { generateFtlFilesCode };
}
