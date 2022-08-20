import { replaceImportsFromStaticInJsCode } from "../../bin/build-keycloak-theme/replacers/replaceImportsFromStaticInJsCode";
import { generateCssCodeToDefineGlobals, replaceImportsInCssCode } from "../../bin/build-keycloak-theme/replacers/replaceImportsInCssCode";
import { replaceImportsInInlineCssCode } from "../../bin/build-keycloak-theme/replacers/replaceImportsInInlineCssCode";
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
        
        function sameAsF() {
            return a.p+"static/js/" + ({}[e] || e) + "." + {
                3: "0664cdc0"
            }[e] + ".chunk.js"
        }

        n.u=function(e){return"static/js/" + e + "." + {
                147: "6c5cee76",
                787: "8da10fcf",
                922: "be170a73"
            } [e] + ".chunk.js"
        }

        t.miniCssF=function(e){return"static/css/"+e+"."+{
                164:"dcfd7749",
                908:"67c9ed2c"
            }[e]+".chunk.css"
        }
    `;

    {
        const { fixedJsCode } = replaceImportsFromStaticInJsCode({
            "jsCode": jsCodeUntransformed,
            "buildOptions": {
                "isStandalone": true
            }
        });

        const fixedJsCodeExpected = `
            function f() {
                return window.kcContext.url.resourcesPath + "/build/static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }

            function sameAsF() {
                return window.kcContext.url.resourcesPath + "/build/static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }

            n[(function (){
                Object.defineProperty(n, "p", {
                    get: function() { return window.kcContext.url.resourcesPath; },
                    set: function (){}
                });
                return "u";
            })()] = function(e) {
                return "/build/static/js/" + e + "." + {
                    147: "6c5cee76",
                    787: "8da10fcf",
                    922: "be170a73"
                } [e] + ".chunk.js"
            }

            t[(function (){
                Object.defineProperty(t, "p", {
                    get: function() { return window.kcContext.url.resourcesPath; },
                    set: function (){}
                });
                return "miniCssF";
            })()] = function(e) {
                return "/build/static/css/" + e + "." + {
                    164:"dcfd7749",
                    908:"67c9ed2c"
                } [e] + ".chunk.css"
            }

        `;

        assetIsSameCode(fixedJsCode, fixedJsCodeExpected);
    }

    {
        const { fixedJsCode } = replaceImportsFromStaticInJsCode({
            "jsCode": jsCodeUntransformed,
            "buildOptions": {
                "isStandalone": false,
                "urlOrigin": "https://demo-app.keycloakify.dev"
            }
        });

        const fixedJsCodeExpected = `
            function f() {
                return ("kcContext" in window ? "https://demo-app.keycloakify.dev" : "") + a.p + "static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }

            function sameAsF() {
                return ("kcContext" in window ? "https://demo-app.keycloakify.dev" : "") + a.p + "static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }

            n[(function (){
                var p= "";
                Object.defineProperty(n, "p", {
                    get: function() { return ("kcContext" in window ? "https://demo-app.keycloakify.dev" : "") + p; },
                    set: function (value){ p = value; }
                });
                return "u";
            })()] = function(e) {
                return "static/js/" + e + "." + {
                    147: "6c5cee76",
                    787: "8da10fcf",
                    922: "be170a73"
                } [e] + ".chunk.js"
            }

            t[(function (){
                var p= "";
                Object.defineProperty(t, "p", {
                    get: function() { return ("kcContext" in window ? "https://demo-app.keycloakify.dev" : "") + p; },
                    set: function (value){ p = value; }
                });
                return "miniCssF";
            })()] = function(e) {
                return "static/css/" + e + "." + {
                    164:"dcfd7749",
                    908:"67c9ed2c"
                } [e] + ".chunk.css"
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
        `
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
        "urldd75cab58377c19": "url(/static/media/something.svg)"
    };

    assert(same(cssGlobalsToDefine, cssGlobalsToDefineExpected));

    const { cssCodeToPrependInHead } = generateCssCodeToDefineGlobals({
        cssGlobalsToDefine,
        "buildOptions": {
            "urlPathname": undefined
        }
    });

    const cssCodeToPrependInHeadExpected = `
        :root {
            --url1f9ef5a892c104c: url(\${url.resourcesPath}/build/logo192.png) no-repeat center center;
            --urldd75cab58377c19: url(\${url.resourcesPath}/build/static/media/something.svg);
        }
    `;

    assetIsSameCode(cssCodeToPrependInHead, cssCodeToPrependInHeadExpected);
}

{
    const { fixedCssCode, cssGlobalsToDefine } = replaceImportsInCssCode({
        "cssCode": `
            .my-div {
                background: url(/x/y/z/logo192.png) no-repeat center center;
            }

            .my-div2 {
                background: url(/x/y/z/logo192.png) no-repeat center center;
            }

            .my-div {
                background-image: url(/x/y/z/static/media/something.svg);
            }
        `
    });

    const fixedCssCodeExpected = `
        .my-div {
            background: var(--urlf8277cddaa2be78);
        }

        .my-div2 {
            background: var(--urlf8277cddaa2be78);
        }

        .my-div {
            background-image: var(--url8bdc0887b97ac9a);
        }
    `;

    assetIsSameCode(fixedCssCode, fixedCssCodeExpected);

    const cssGlobalsToDefineExpected = {
        "urlf8277cddaa2be78": "url(/x/y/z/logo192.png) no-repeat center center",
        "url8bdc0887b97ac9a": "url(/x/y/z/static/media/something.svg)"
    };

    assert(same(cssGlobalsToDefine, cssGlobalsToDefineExpected));

    const { cssCodeToPrependInHead } = generateCssCodeToDefineGlobals({
        cssGlobalsToDefine,
        "buildOptions": {
            "urlPathname": "/x/y/z/"
        }
    });

    const cssCodeToPrependInHeadExpected = `
        :root {
            --urlf8277cddaa2be78: url(\${url.resourcesPath}/build/logo192.png) no-repeat center center;
            --url8bdc0887b97ac9a: url(\${url.resourcesPath}/build/static/media/something.svg);
        }
    `;

    assetIsSameCode(cssCodeToPrependInHead, cssCodeToPrependInHeadExpected);
}

{
    const cssCode = `
        @font-face {
          font-family: "Work Sans";
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url("/fonts/WorkSans/worksans-regular-webfont.woff2") format("woff2");
        }
        @font-face {
          font-family: "Work Sans";
          font-style: normal;
          font-weight: 500;
          font-display: swap;
          src: url("/fonts/WorkSans/worksans-medium-webfont.woff2") format("woff2");
        }
        @font-face {
          font-family: "Work Sans";
          font-style: normal;
          font-weight: 600;
          font-display: swap;
          src: url("/fonts/WorkSans/worksans-semibold-webfont.woff2") format("woff2");
        }
        @font-face {
          font-family: "Work Sans";
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url("/fonts/WorkSans/worksans-bold-webfont.woff2") format("woff2");
        }
    `;

    {
        const { fixedCssCode } = replaceImportsInInlineCssCode({
            cssCode,
            "buildOptions": {
                "isStandalone": true,
                "urlPathname": undefined
            }
        });

        const fixedCssCodeExpected = `
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url(\${url.resourcesPath}/build/fonts/WorkSans/worksans-regular-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 500;
              font-display: swap;
              src: url(\${url.resourcesPath}/build/fonts/WorkSans/worksans-medium-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: url(\${url.resourcesPath}/build/fonts/WorkSans/worksans-semibold-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url(\${url.resourcesPath}/build/fonts/WorkSans/worksans-bold-webfont.woff2)
                format("woff2");
            }
        `;

        assetIsSameCode(fixedCssCode, fixedCssCodeExpected);
    }

    {
        const { fixedCssCode } = replaceImportsInInlineCssCode({
            cssCode,
            "buildOptions": {
                "isStandalone": false,
                "urlOrigin": "https://demo-app.keycloakify.dev",
                "urlPathname": undefined
            }
        });

        const fixedCssCodeExpected = `
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url(https://demo-app.keycloakify.dev/fonts/WorkSans/worksans-regular-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 500;
              font-display: swap;
              src: url(https://demo-app.keycloakify.dev/fonts/WorkSans/worksans-medium-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: url(https://demo-app.keycloakify.dev/fonts/WorkSans/worksans-semibold-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url(https://demo-app.keycloakify.dev/fonts/WorkSans/worksans-bold-webfont.woff2)
                format("woff2");
            }
        `;

        assetIsSameCode(fixedCssCode, fixedCssCodeExpected);
    }
}

{
    const cssCode = `
        @font-face {
          font-family: "Work Sans";
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url("/x/y/z/fonts/WorkSans/worksans-regular-webfont.woff2") format("woff2");
        }
        @font-face {
          font-family: "Work Sans";
          font-style: normal;
          font-weight: 500;
          font-display: swap;
          src: url("/x/y/z/fonts/WorkSans/worksans-medium-webfont.woff2") format("woff2");
        }
        @font-face {
          font-family: "Work Sans";
          font-style: normal;
          font-weight: 600;
          font-display: swap;
          src: url("/x/y/z/fonts/WorkSans/worksans-semibold-webfont.woff2") format("woff2");
        }
        @font-face {
          font-family: "Work Sans";
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url("/x/y/z/fonts/WorkSans/worksans-bold-webfont.woff2") format("woff2");
        }
    `;

    {
        const { fixedCssCode } = replaceImportsInInlineCssCode({
            cssCode,
            "buildOptions": {
                "isStandalone": true,
                "urlPathname": "/x/y/z/"
            }
        });

        const fixedCssCodeExpected = `
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url(\${url.resourcesPath}/build/fonts/WorkSans/worksans-regular-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 500;
              font-display: swap;
              src: url(\${url.resourcesPath}/build/fonts/WorkSans/worksans-medium-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: url(\${url.resourcesPath}/build/fonts/WorkSans/worksans-semibold-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url(\${url.resourcesPath}/build/fonts/WorkSans/worksans-bold-webfont.woff2)
                format("woff2");
            }
        `;

        assetIsSameCode(fixedCssCode, fixedCssCodeExpected);
    }

    {
        const { fixedCssCode } = replaceImportsInInlineCssCode({
            cssCode,
            "buildOptions": {
                "isStandalone": false,
                "urlOrigin": "https://demo-app.keycloakify.dev",
                "urlPathname": "/x/y/z/"
            }
        });

        const fixedCssCodeExpected = `
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url(https://demo-app.keycloakify.dev/x/y/z/fonts/WorkSans/worksans-regular-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 500;
              font-display: swap;
              src: url(https://demo-app.keycloakify.dev/x/y/z/fonts/WorkSans/worksans-medium-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: url(https://demo-app.keycloakify.dev/x/y/z/fonts/WorkSans/worksans-semibold-webfont.woff2)
                format("woff2");
            }
            @font-face {
              font-family: "Work Sans";
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url(https://demo-app.keycloakify.dev/x/y/z/fonts/WorkSans/worksans-bold-webfont.woff2)
                format("woff2");
            }
        `;

        assetIsSameCode(fixedCssCode, fixedCssCodeExpected);
    }
}

console.log("PASS replace import from static");
