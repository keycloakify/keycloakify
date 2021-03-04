

import cheerio from "cheerio";
import {
    replaceImportFromStaticInJsCode,
    generateCssCodeToDefineGlobals
} from "../replaceImportFromStatic";
import fs from "fs";
import { join as pathJoin } from "path";
import { objectKeys } from "evt/tools/typeSafety/objectKeys";

function loadFtlFile(ftlFileBasename: "template.ftl" | "login.ftl" | "register.ftl") {
    return fs.readFileSync(pathJoin(__dirname, ftlFileBasename))
        .toString("utf8")
        .match(/^<script>const _=((?:.|\n)+)<\/script>[\n]?$/)![1];
}


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

            $(element).attr(attrName, "${url.resourcesPath}/build" + href);

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
            '    Object.deepAssign(',
            `        window.${ftlValuesGlobalName},`,
            `        ${objectKeys(ftlCommonPlaceholders)[0]}`,
            '    );',
            '</script>',
            '',
            objectKeys(ftlCommonPlaceholders)[1],
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

        const ftlPlaceholders = {
            '{ "x": "kxOlLqMeOed9sdLdIdOxd444" }': loadFtlFile(pageBasename),
            ...ftlCommonPlaceholders
        };

        $("head").prepend(
            [
                '',
                '<script>',
                '',
                `    window.${ftlValuesGlobalName} = Object.assign(`,
                `        { "pageBasename": "${pageBasename}" },`,
                `        ${objectKeys(ftlPlaceholders)[0]}`,
                '    );',
                '',
                '    Object.defineProperty(',
                '        Object,',
                '        "deepAssign",',
                '        {',
                '            "value": function callee(target, source) {',
                '                Object.keys(source).forEach(function (key) {',
                '                    var value = source[key];',
                '                    if( target[key] === undefined ){',
                '                            target[key]= value;',
                '                            return;',
                '                    }',
                '                    if( value instanceof Object ){',
                '                            if( value instanceof Array ){',
                '                                value.forEach(function (entry){',
                '                                        target[key].push(entry);',
                '                                });',
                '                                return;',
                '                            }',
                '                            callee(target[key], value);',
                '                            return;',
                '                    }',
                '                    target[key]= value;',
                '                });',
                '                return target;',
                '            }',
                '        }',
                '    );',
                '',
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