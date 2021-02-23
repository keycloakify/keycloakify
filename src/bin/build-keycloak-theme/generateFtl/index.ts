

import cheerio from "cheerio";
import {
    replaceImportFromStaticInJsCode,
    generateCssCodeToDefineGlobals
} from "../replaceImportFromStatic";
import fs from "fs";
import { join as pathJoin } from "path";
import { objectKeys } from "evt/tools/typeSafety/objectKeys";

export function generateFtlFilesCodeFactory(
    params: {
        ftlValuesGlobalName: string;
        cssGlobalsToDefine: Record<string, string>;
        indexHtmlCode: string;
    }
) {

    const { ftlValuesGlobalName, cssGlobalsToDefine, indexHtmlCode } = params;

    const $ = cheerio.load(indexHtmlCode);

    $("script:not([src])").each((...[, element]) => {

        const { fixedJsCode } = replaceImportFromStaticInJsCode({
            ftlValuesGlobalName,
            "jsCode": $(element).html()!
        });

        $(element).text(fixedJsCode);

    });


    ([
        ["link", "href"],
        ["script", "src"],
    ] as const).forEach(([selector, attrName]) =>
        $(selector).each((...[, element]) => {

            const href = $(element).attr(attrName);

            if (!href?.startsWith("/")) {
                return;
            }

            $(element).attr(attrName, "${url.resourcesPath}" + href);

        })
    );

    //FTL is no valid html, we can't insert with cheerio, we put placeholder for injecting later.
    const ftlPlaceholders = {
        '{ "x": "xIdLqMeOed9sdLdIdOxdK0d" }':
            fs.readFileSync(pathJoin(__dirname, "ftl2js.ftl"))
                .toString("utf8")
                .match(/^<script>const _=((?:.|\n)+)<\/script>[\n]?$/)![1],
        '<!-- xIdLqMeOedErIdLsPdNdI9dSlxI -->':
            [
                '<#if scripts??>',
                '    <#list scripts as script>',
                '        <script src="${script}" type="text/javascript"></script>',
                '    </#list>',
                '</#if>',
            ].join("\n")
    };

    $("head").prepend(
        [
            ...(Object.keys(cssGlobalsToDefine).length === 0 ? [] : [
                '',
                '<style>',
                generateCssCodeToDefineGlobals(
                    { cssGlobalsToDefine }
                ).cssCodeToPrependInHead,
                '</style>',
                ''
            ]),
            '<script>',
            '    Object.assign(',
            `        window.${ftlValuesGlobalName},`,
            `        ${objectKeys(ftlPlaceholders)[0]}`,
            '    );',
            '</script>',
            '',
            objectKeys(ftlPlaceholders)[1],
            ''
        ].join("\n"),
    );


    const partiallyFixedIndexHtmlCode = $.html();

    function generateFtlFilesCode(
        params: {
            pageBasename: "login.ftl" | "register.ftl"
        }
    ): { ftlCode: string; } {

        const { pageBasename } = params;

        const $ = cheerio.load(partiallyFixedIndexHtmlCode);

        $("head").prepend(
            [
                '',
                '<script>',
                `   window.${ftlValuesGlobalName} = { "pageBasename": "${pageBasename}" };`,
                '</script>',
                ''
            ].join("\n")
        );

        let ftlCode = $.html();

        objectKeys(ftlPlaceholders)
            .forEach(id => ftlCode = ftlCode.replace(id, ftlPlaceholders[id]));

        return { ftlCode };

    }

    return { generateFtlFilesCode };


}