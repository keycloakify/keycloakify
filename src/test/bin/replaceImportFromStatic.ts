import {
    replaceImportsFromStaticInJsCode,
    replaceImportsInCssCode,
    generateCssCodeToDefineGlobals,
} from "../../bin/build-keycloak-theme/replaceImportFromStatic";
import { assert } from "tsafe/assert";
import { same } from "evt/tools/inDepth/same";
import { assetIsSameCode } from "../tools/assertIsSameCode";

{
    const jsCodeUntransformed = `
        function f() {
            return a.p+"static/js/" + ({}[e] || e) + "." + {
                3: "0664cdc0"
            }[e] + ".chunk.js"
        }
        
        function f2() {
            return a.p+"static/js/" + ({}[e] || e) + "." + {
                3: "0664cdc0"
            }[e] + ".chunk.js"
        }
    `;

    {
        const { fixedJsCode } = replaceImportsFromStaticInJsCode({
            "jsCode": jsCodeUntransformed,
            "urlOrigin": undefined,
        });

        const fixedJsCodeExpected = `
            function f() {
                return window.kcContext.url.resourcesPath + "/build/static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }

            function f2() {
                return window.kcContext.url.resourcesPath + "/build/static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }
        `;

        assetIsSameCode(fixedJsCode, fixedJsCodeExpected);
    }

    {
        const urlOrigin = "https://example.com";

        const { fixedJsCode } = replaceImportsFromStaticInJsCode({
            "jsCode": jsCodeUntransformed,
            urlOrigin,
        });

        const fixedJsCodeExpected = `
            function f() {
                return ("kcContext" in window ? "${urlOrigin}" : "") + a.p + "static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }

            function f2() {
                return ("kcContext" in window ? "${urlOrigin}" : "") + a.p + "static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }
        `;

        assetIsSameCode(fixedJsCode, fixedJsCodeExpected);
    }
}

{
    const { fixedCssCode, cssGlobalsToDefine } = replaceImportsInCssCode({
        "cssCode": `
            .my-div {
                background: url(/logo192.png) no-repeat center center;
            }

            .my-div2 {
                background: url(/logo192.png) no-repeat center center;
            }

            .my-div {
                background-image: url(/static/media/something.svg);
            }
        `,
    });

    const fixedCssCodeExpected = `
        .my-div {
            background: var(--url1f9ef5a892c104c);
        }

        .my-div2 {
            background: var(--url1f9ef5a892c104c);
        }

        .my-div {
            background-image: var(--urldd75cab58377c19);
        }
    `;

    assetIsSameCode(fixedCssCode, fixedCssCodeExpected);

    const cssGlobalsToDefineExpected = {
        "url1f9ef5a892c104c": "url(/logo192.png) no-repeat center center",
        "urldd75cab58377c19": "url(/static/media/something.svg)",
    };

    assert(same(cssGlobalsToDefine, cssGlobalsToDefineExpected));

    const { cssCodeToPrependInHead } = generateCssCodeToDefineGlobals({
        cssGlobalsToDefine,
        "urlPathname": "/",
    });

    const cssCodeToPrependInHeadExpected = `
        :root {
            --url1f9ef5a892c104c: url(\${url.resourcesPath}/build/logo192.png) no-repeat center center;
            --urldd75cab58377c19: url(\${url.resourcesPath}/build/static/media/something.svg);
        }
    `;

    assetIsSameCode(cssCodeToPrependInHead, cssCodeToPrependInHeadExpected);
}

console.log("PASS replace import from static");
