
import { 
    replaceImportsFromStaticInJsCode,
    replaceImportsInCssCode,
    generateCssCodeToDefineGlobals
} from "../../bin/build-keycloak-theme/replaceImportFromStatic";

const { fixedJsCode } = replaceImportsFromStaticInJsCode({
    "jsCode": `
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
    `,
    "urlOrigin": undefined
});

const { fixedJsCode: fixedJsCodeExternal } = replaceImportsFromStaticInJsCode({
    "jsCode": `
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
    `,
    "urlOrigin": "https://www.example.com"
});

console.log({ fixedJsCode, fixedJsCodeExternal });

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
    `
});


console.log({ fixedCssCode, cssGlobalsToDefine });


const { cssCodeToPrependInHead } = generateCssCodeToDefineGlobals({ cssGlobalsToDefine, "urlPathname": "/" });

console.log({ cssCodeToPrependInHead });