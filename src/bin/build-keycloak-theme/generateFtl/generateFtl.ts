import cheerio from "cheerio";
import {
    replaceImportsFromStaticInJsCode,
    replaceImportsInInlineCssCode,
    generateCssCodeToDefineGlobals,
} from "../replaceImportFromStatic";
import fs from "fs";
import { join as pathJoin } from "path";
import { objectKeys } from "tsafe/objectKeys";
import { ftlValuesGlobalName } from "../ftlValuesGlobalName";

export const pageIds = [
    "login.ftl",
    "register.ftl",
    "register-user-profile.ftl",
    "info.ftl",
    "error.ftl",
    "login-reset-password.ftl",
    "login-verify-email.ftl",
    "terms.ftl",
    "login-otp.ftl",
    "login-update-profile.ftl",
    "login-idp-link-confirm.ftl",
] as const;

export type PageId = typeof pageIds[number];

function loadAdjacentFile(fileBasename: string) {
    return fs.readFileSync(pathJoin(__dirname, fileBasename)).toString("utf8");
}

export function generateFtlFilesCodeFactory(params: {
    cssGlobalsToDefine: Record<string, string>;
    indexHtmlCode: string;
    urlPathname: string;
    urlOrigin: undefined | string;
}) {
    const { cssGlobalsToDefine, indexHtmlCode, urlPathname, urlOrigin } =
        params;

    const $ = cheerio.load(indexHtmlCode);

    $("script:not([src])").each((...[, element]) => {
        const { fixedJsCode } = replaceImportsFromStaticInJsCode({
            "jsCode": $(element).html()!,
            urlOrigin,
        });

        $(element).text(fixedJsCode);
    });

    $("style").each((...[, element]) => {
        const { fixedCssCode } = replaceImportsInInlineCssCode({
            "cssCode": $(element).html()!,
            "urlPathname": params.urlPathname,
            urlOrigin,
        });

        $(element).text(fixedCssCode);
    });

    (
        [
            ["link", "href"],
            ["script", "src"],
        ] as const
    ).forEach(([selector, attrName]) =>
        $(selector).each((...[, element]) => {
            const href = $(element).attr(attrName);

            if (href === undefined) {
                return;
            }

            $(element).attr(
                attrName,
                urlOrigin !== undefined
                    ? href.replace(/^\//, `${urlOrigin}/`)
                    : href.replace(
                          new RegExp(`^${urlPathname.replace(/\//g, "\\/")}`),
                          "${url.resourcesPath}/build/",
                      ),
            );
        }),
    );

    //FTL is no valid html, we can't insert with cheerio, we put placeholder for injecting later.
    const ftlPlaceholders = {
        '{ "x": "vIdLqMeOed9sdLdIdOxdK0d" }': loadAdjacentFile(
            "common.ftl",
        ).match(/^<script>const _=((?:.|\n)+)<\/script>[\n]?$/)![1],
        "<!-- xIdLqMeOedErIdLsPdNdI9dSlxI -->": [
            "<#if scripts??>",
            "    <#list scripts as script>",
            '        <script src="${script}" type="text/javascript"></script>',
            "    </#list>",
            "</#if>",
        ].join("\n"),
    };

    const pageSpecificCodePlaceholder =
        "<!-- dIddLqMeOedErIdLsPdNdI9dSl42sw -->";

    $("head").prepend(
        [
            ...(Object.keys(cssGlobalsToDefine).length === 0
                ? []
                : [
                      "",
                      "<style>",
                      generateCssCodeToDefineGlobals({
                          cssGlobalsToDefine,
                          urlPathname,
                      }).cssCodeToPrependInHead,
                      "</style>",
                      "",
                  ]),
            "<script>",
            loadAdjacentFile("Object.deepAssign.js"),
            "</script>",
            "<script>",
            `    window.${ftlValuesGlobalName}= Object.assign(`,
            `        {},`,
            `        ${objectKeys(ftlPlaceholders)[0]}`,
            "    );",
            "</script>",
            "",
            pageSpecificCodePlaceholder,
            "",
            objectKeys(ftlPlaceholders)[1],
        ].join("\n"),
    );

    const partiallyFixedIndexHtmlCode = $.html();

    function generateFtlFilesCode(params: { pageId: string }): {
        ftlCode: string;
    } {
        const { pageId } = params;

        const $ = cheerio.load(partiallyFixedIndexHtmlCode);

        let ftlCode = $.html().replace(
            pageSpecificCodePlaceholder,
            [
                "<script>",
                `    Object.deepAssign(`,
                `        window.${ftlValuesGlobalName},`,
                `        { "pageId": "${pageId}" }`,
                "    );",
                "</script>",
            ].join("\n"),
        );

        objectKeys(ftlPlaceholders).forEach(
            id => (ftlCode = ftlCode.replace(id, ftlPlaceholders[id])),
        );

        return { ftlCode };
    }

    return { generateFtlFilesCode };
}
