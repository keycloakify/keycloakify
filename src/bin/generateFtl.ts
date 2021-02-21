

import cheerio from "cheerio";
import {
    replaceImportFromStaticInJsCode,
    generateCssCodeToDefineGlobals
} from "./replaceImportFromStatic";

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

        $(element).html(fixedJsCode);

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

    $("head").prepend(
        [
            '',
            '<style>',
            generateCssCodeToDefineGlobals(
                { cssGlobalsToDefine }
            ).cssCodeToPrependInHead,
            '</style>',
            '',
            '<script>',
            '    Object.assign(',
            `        window.${ftlValuesGlobalName},`,
            '        {',
            '            "url": {',
            '                "loginAction": "${url.loginAction}",',
            '                "resourcesPath": "${url.resourcesPath}"',
            '            }',
            '        }',
            '    });',
            '</script>',
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
                `   window.${ftlValuesGlobalName} = { "pageBasename": "${pageBasename}" };'`,
                '</script>',
                ''
            ].join("\n"),

        );

        return { "ftlCode": $.html() };

    }

    return { generateFtlFilesCode };


}