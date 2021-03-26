

import cheerio from "cheerio";
import {
    replaceImportsFromStaticInJsCode,
    replaceImportsInInlineCssCode,
    generateCssCodeToDefineGlobals
} from "../replaceImportFromStatic";
import fs from "fs";
import { join as pathJoin } from "path";
import { objectKeys } from "evt/tools/typeSafety/objectKeys";

export const pageIds = ["login.ftl", "register.ftl", "info.ftl", "error.ftl", "login-reset-password.ftl", "login-verify-email.ftl"] as const;

export type PageId = typeof pageIds[number];

function loadAdjacentFile(fileBasename: string) {
    return fs.readFileSync(pathJoin(__dirname, fileBasename))
        .toString("utf8");
};

function loadFtlFile(ftlFileBasename: PageId | "template.ftl") {
    try {

        return loadAdjacentFile(ftlFileBasename)
            .match(/^<script>const _=((?:.|\n)+)<\/script>[\n]?$/)![1];

    } catch {
        return "{}";
    }
}

export type Mode = {
    type: "standalone";
    urlPathname: string;
} | {
    type: "external assets";
    urlPathname: string;
    urlOrigin: string;
}

export function generateFtlFilesCodeFactory(
    params: {
        ftlValuesGlobalName: string;
        cssGlobalsToDefine: Record<string, string>;
        indexHtmlCode: string;
        mode: Mode;
    }
) {

    const { ftlValuesGlobalName, cssGlobalsToDefine, indexHtmlCode, mode } = params;

    const $ = cheerio.load(indexHtmlCode);

    $("script:not([src])").each((...[, element]) => {

        const { fixedJsCode } = replaceImportsFromStaticInJsCode({
            ftlValuesGlobalName,
            "jsCode": $(element).html()!,
            mode
        });

        $(element).text(fixedJsCode);

    });

    $("style").each((...[, element]) => {

        const { fixedCssCode } = replaceImportsInInlineCssCode({
            "cssCode": $(element).html()!,
            mode
        });

        $(element).text(fixedCssCode);

    });

    ([
        ["link", "href"],
        ["script", "src"],
    ] as const).forEach(([selector, attrName]) =>
        $(selector).each((...[, element]) => {

            const href = $(element).attr(attrName);

            if (href === undefined) {
                return;
            }

            switch (mode.type) {
                case "external assets":
                    $(element).attr(
                        attrName,
                        href.replace(/^\//, `${mode.urlOrigin}/`)
                    );
                    break;
                case "standalone":
                    $(element).attr(
                        attrName,
                        href.replace(
                            new RegExp(`^${mode.urlPathname.replace(/\//g, "\\/")}`),
                            "${url.resourcesPath}/build/"
                        )
                    );
                    break;
            }


        })
    );

    //FTL is no valid html, we can't insert with cheerio, we put placeholder for injecting later.
    const ftlCommonPlaceholders = {
        '{ "x": "vIdLqMeOed9sdLdIdOxdK0d" }': loadFtlFile("template.ftl"),
        '<!-- xIdLqMeOedErIdLsPdNdI9dSlxI -->':
            [
                '<#if scripts??>',
                '    <#list scripts as script>',
                '        <script src="${script}" type="text/javascript"></script>',
                '    </#list>',
                '</#if>'
            ].join("\n")
    };

    const pageSpecificCodePlaceholder = "<!-- dIddLqMeOedErIdLsPdNdI9dSl42sw -->";

    $("head").prepend(
        [
            ...(Object.keys(cssGlobalsToDefine).length === 0 ? [] : [
                '',
                '<style>',
                generateCssCodeToDefineGlobals({
                    cssGlobalsToDefine,
                    "urlPathname": mode.urlPathname
                }).cssCodeToPrependInHead,
                '</style>',
                ''
            ]),
            ...["Object.deepAssign.js", "String.htmlUnescape.js"].map(
                fileBasename => [
                    "<script>",
                    loadAdjacentFile(fileBasename),
                    "</script>"
                ].join("\n")
            ),
            '<script>',
            `    window.${ftlValuesGlobalName}= Object.assign(`,
            `        {},`,
            `        ${objectKeys(ftlCommonPlaceholders)[0]}`,
            '    );',
            '</script>',
            '',
            pageSpecificCodePlaceholder,
            '',
            objectKeys(ftlCommonPlaceholders)[1]
        ].join("\n"),
    );

    const partiallyFixedIndexHtmlCode = $.html();

    function generateFtlFilesCode(
        params: {
            pageId: PageId;
        }
    ): { ftlCode: string; } {

        const { pageId } = params;

        const $ = cheerio.load(partiallyFixedIndexHtmlCode);

        const ftlPlaceholders = {
            '{ "x": "kxOlLqMeOed9sdLdIdOxd444" }': loadFtlFile(pageId),
            ...ftlCommonPlaceholders
        };

        let ftlCode = $.html()
            .replace(
                pageSpecificCodePlaceholder,
                [
                    '<script>',
                    `    Object.deepAssign(`,
                    `        window.${ftlValuesGlobalName},`,
                    `        { "pageId": "${pageId}" }`,
                    '    );',
                    `    Object.deepAssign(`,
                    `        window.${ftlValuesGlobalName},`,
                    `        ${objectKeys(ftlPlaceholders)[0]}`,
                    '    );',
                    '</script>'
                ].join("\n")
            );

        objectKeys(ftlPlaceholders)
            .forEach(id => ftlCode = ftlCode.replace(id, ftlPlaceholders[id]));

        return { ftlCode };

    }

    return { generateFtlFilesCode };


}