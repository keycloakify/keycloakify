import cheerio from "cheerio";
import { replaceImportsFromStaticInJsCode, replaceImportsInInlineCssCode, generateCssCodeToDefineGlobals } from "../replaceImportFromStatic";
import fs from "fs";
import { join as pathJoin } from "path";
import { objectKeys } from "tsafe/objectKeys";
import { ftlValuesGlobalName } from "../ftlValuesGlobalName";

// https://github.com/keycloak/keycloak/blob/main/services/src/main/java/org/keycloak/forms/login/freemarker/Templates.java
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
    "login-update-password.ftl",
    "login-idp-link-confirm.ftl",
    "login-idp-link-email.ftl",
    "login-page-expired.ftl",
    "login-config-totp.ftl",
    "logout-confirm.ftl",
] as const;

export type PageId = typeof pageIds[number];

export function generateFtlFilesCodeFactory(params: {
    cssGlobalsToDefine: Record<string, string>;
    indexHtmlCode: string;
    urlPathname: string;
    urlOrigin: undefined | string;
}) {
    const { cssGlobalsToDefine, indexHtmlCode, urlPathname, urlOrigin } = params;

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
                    : href.replace(new RegExp(`^${urlPathname.replace(/\//g, "\\/")}`), "${url.resourcesPath}/build/"),
            );
        }),
    );

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
            "</#if>",
        ].join("\n"),
    };

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
            `    window.${ftlValuesGlobalName}= ${objectKeys(replaceValueBySearchValue)[0]};`,
            "</script>",
            "",
            objectKeys(replaceValueBySearchValue)[1],
        ].join("\n"),
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
            "PAGE_ID_xIgLsPgGId9D8e": pageId,
        }).map(([searchValue, replaceValue]) => (ftlCode = ftlCode.replace(searchValue, replaceValue)));

        return { ftlCode };
    }

    return { generateFtlFilesCode };
}
