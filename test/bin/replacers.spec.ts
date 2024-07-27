import { replaceImportsInJsCode_vite } from "keycloakify/bin/keycloakify/replacers/replaceImportsInJsCode/vite";
import { replaceImportsInJsCode_webpack } from "keycloakify/bin/keycloakify/replacers/replaceImportsInJsCode/webpack";
import { replaceImportsInCssCode } from "keycloakify/bin/keycloakify/replacers/replaceImportsInCssCode";
import { expect, it, describe } from "vitest";
import { BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR } from "keycloakify/bin/shared/constants";

describe("js replacer - vite", () => {
    it("replaceImportsInJsCode_vite - 1", () => {
        const before = `Uv="modulepreload",`;
        const after = `,Wc={},`;
        const jsCodeUntransformed = `${before}Hv=function(e){return"/foo-bar-baz/"+e}${after}`;

        const { fixedJsCode } = replaceImportsInJsCode_vite({
            jsCode: jsCodeUntransformed,
            basenameOfAssetsFiles: [],
            buildContext: {
                projectBuildDirPath: "/Users/someone/github/keycloakify-starter/dist/",
                assetsDirPath: "/Users/someone/github/keycloakify-starter/dist/assets/",
                urlPathname: "/foo-bar-baz/"
            }
        });

        const fixedJsCodeExpected = `${before}Hv=function(e){return"/"+e}${after}`;

        expect(isSameCode(fixedJsCode, fixedJsCodeExpected)).toBe(true);
    });

    it("replaceImportsInJsCode_vite - 2", () => {
        const before = `Uv="modulepreload",`;
        const after = `,Wc={},`;
        const jsCodeUntransformed = `${before}Hv=function(e){return"/foo/bar/baz/"+e}${after}`;

        const { fixedJsCode } = replaceImportsInJsCode_vite({
            jsCode: jsCodeUntransformed,
            basenameOfAssetsFiles: [],
            buildContext: {
                projectBuildDirPath: "/Users/someone/github/keycloakify-starter/dist/",
                assetsDirPath: "/Users/someone/github/keycloakify-starter/dist/assets/",
                urlPathname: "/foo/bar/baz/"
            }
        });

        const fixedJsCodeExpected = `${before}Hv=function(e){return"/"+e}${after}`;

        expect(isSameCode(fixedJsCode, fixedJsCodeExpected)).toBe(true);
    });

    it("replaceImportsInJsCode_vite - 3", () => {
        const jsCodeUntransformed = `
            S="/assets/keycloakify-logo-mqjydaoZ.png",H=(()=>{

            function __vite__mapDeps(indexes) {
                if (!__vite__mapDeps.viteFileDeps) {
                    __vite__mapDeps.viteFileDeps = ["assets/Login-dJpPRzM4.js", "assets/index-XwzrZ5Gu.js"]
                }
                return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
            }
        `;

        for (const { projectBuildDirPath, assetsDirPath, systemType } of [
            {
                systemType: "posix",
                projectBuildDirPath: "/Users/someone/github/keycloakify-starter/dist",
                assetsDirPath: "/Users/someone/github/keycloakify-starter/dist/assets"
            },
            {
                systemType: "win32",
                projectBuildDirPath:
                    "C:\\\\Users\\someone\\github\\keycloakify-starter\\dist",
                assetsDirPath:
                    "C:\\\\Users\\someone\\github\\keycloakify-starter\\dist\\assets"
            }
        ] as const) {
            const { fixedJsCode } = replaceImportsInJsCode_vite({
                jsCode: jsCodeUntransformed,
                basenameOfAssetsFiles: [
                    "Login-dJpPRzM4.js",
                    "index-XwzrZ5Gu.js",
                    "keycloakify-logo-mqjydaoZ.png"
                ],
                buildContext: {
                    projectBuildDirPath,
                    assetsDirPath,
                    urlPathname: undefined
                },
                systemType
            });

            const fixedJsCodeExpected = `
                    S=(window.kcContext["x-keycloakify"].resourcesPath + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/keycloakify-logo-mqjydaoZ.png"),H=(()=>{

                    function __vite__mapDeps(indexes) {
                        if (!__vite__mapDeps.viteFileDeps) {
                            __vite__mapDeps.viteFileDeps = [
                                (window.kcContext["x-keycloakify"].resourcesPath.substring(1) + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/Login-dJpPRzM4.js"), 
                                (window.kcContext["x-keycloakify"].resourcesPath.substring(1) + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/index-XwzrZ5Gu.js")
                            ]
                        }
                        return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
                    }
                `;

            expect(isSameCode(fixedJsCode, fixedJsCodeExpected)).toBe(true);
        }
    });

    it("replaceImportsInJsCode_vite - 4", () => {
        const jsCodeUntransformed = `
            S="/foo/bar/keycloakify-logo-mqjydaoZ.png",H=(()=>{

            function __vite__mapDeps(indexes) {
                if (!__vite__mapDeps.viteFileDeps) {
                    __vite__mapDeps.viteFileDeps = ["foo/bar/Login-dJpPRzM4.js", "foo/bar/index-XwzrZ5Gu.js"]
                }
                return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
            }
        `;

        for (const { projectBuildDirPath, assetsDirPath, systemType } of [
            {
                systemType: "posix",
                projectBuildDirPath: "/Users/someone/github/keycloakify-starter/dist",
                assetsDirPath: "/Users/someone/github/keycloakify-starter/dist/foo/bar"
            },
            {
                systemType: "win32",
                projectBuildDirPath:
                    "C:\\\\Users\\someone\\github\\keycloakify-starter\\dist",
                assetsDirPath:
                    "C:\\\\Users\\someone\\github\\keycloakify-starter\\dist\\foo\\bar"
            }
        ] as const) {
            const { fixedJsCode } = replaceImportsInJsCode_vite({
                jsCode: jsCodeUntransformed,
                basenameOfAssetsFiles: [
                    "Login-dJpPRzM4.js",
                    "index-XwzrZ5Gu.js",
                    "keycloakify-logo-mqjydaoZ.png"
                ],
                buildContext: {
                    projectBuildDirPath,
                    assetsDirPath,
                    urlPathname: undefined
                },
                systemType
            });

            const fixedJsCodeExpected = `
                    S=(window.kcContext["x-keycloakify"].resourcesPath + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/foo/bar/keycloakify-logo-mqjydaoZ.png"),H=(()=>{

                    function __vite__mapDeps(indexes) {
                        if (!__vite__mapDeps.viteFileDeps) {
                            __vite__mapDeps.viteFileDeps = [
                                (window.kcContext["x-keycloakify"].resourcesPath.substring(1) + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/foo/bar/Login-dJpPRzM4.js"), 
                                (window.kcContext["x-keycloakify"].resourcesPath.substring(1) + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/foo/bar/index-XwzrZ5Gu.js")
                            ]
                        }
                        return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
                    }
                `;

            expect(isSameCode(fixedJsCode, fixedJsCodeExpected)).toBe(true);
        }
    });

    it("replaceImportsInJsCode_vite - 5", () => {
        const jsCodeUntransformed = `
            S="/foo-bar-baz/assets/keycloakify-logo-mqjydaoZ.png",H=(()=>{

            function __vite__mapDeps(indexes) {
                if (!__vite__mapDeps.viteFileDeps) {
                    __vite__mapDeps.viteFileDeps = ["assets/Login-dJpPRzM4.js", "assets/index-XwzrZ5Gu.js"]
                }
                return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
            }
        `;

        for (const { projectBuildDirPath, assetsDirPath, systemType } of [
            {
                systemType: "posix",
                projectBuildDirPath: "/Users/someone/github/keycloakify-starter/dist",
                assetsDirPath: "/Users/someone/github/keycloakify-starter/dist/assets"
            },
            {
                systemType: "win32",
                projectBuildDirPath:
                    "C:\\\\Users\\someone\\github\\keycloakify-starter\\dist",
                assetsDirPath:
                    "C:\\\\Users\\someone\\github\\keycloakify-starter\\dist\\assets"
            }
        ] as const) {
            const { fixedJsCode } = replaceImportsInJsCode_vite({
                jsCode: jsCodeUntransformed,
                basenameOfAssetsFiles: [
                    "Login-dJpPRzM4.js",
                    "index-XwzrZ5Gu.js",
                    "keycloakify-logo-mqjydaoZ.png"
                ],
                buildContext: {
                    projectBuildDirPath,
                    assetsDirPath,
                    urlPathname: "/foo-bar-baz/"
                },
                systemType
            });

            const fixedJsCodeExpected = `
                    S=(window.kcContext["x-keycloakify"].resourcesPath + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/keycloakify-logo-mqjydaoZ.png"),H=(()=>{

                    function __vite__mapDeps(indexes) {
                        if (!__vite__mapDeps.viteFileDeps) {
                            __vite__mapDeps.viteFileDeps = [
                                (window.kcContext["x-keycloakify"].resourcesPath.substring(1) + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/Login-dJpPRzM4.js"), 
                                (window.kcContext["x-keycloakify"].resourcesPath.substring(1) + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/index-XwzrZ5Gu.js")
                            ]
                        }
                        return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
                    }
                `;

            expect(isSameCode(fixedJsCode, fixedJsCodeExpected)).toBe(true);
        }
    });
});

describe("js replacer - webpack", () => {
    it("replaceImportsInJsCode_webpack - 1", () => {
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

            __webpack_require__.u=function(e){return"static/js/" + e + "." + {
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
        
            n.u=e=>"static/js/"+e+"."+{69:"4f205f87",128:"49264537",453:"b2fed72e",482:"f0106901"}[e]+".chunk.js"
        
            t.miniCssF=e=>"static/css/"+e+"."+{164:"dcfd7749",908:"67c9ed2c"}[e]+".chunk.css"
        `;

        const { fixedJsCode } = replaceImportsInJsCode_webpack({
            jsCode: jsCodeUntransformed,
            buildContext: {
                projectBuildDirPath: "/Users/someone/github/keycloakify-starter/build",
                assetsDirPath: "/Users/someone/github/keycloakify-starter/build/static",
                urlPathname: undefined
            }
        });

        const fixedJsCodeExpected = `
            function f() {
                return window.kcContext["x-keycloakify"].resourcesPath + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }

            function sameAsF() {
                return window.kcContext["x-keycloakify"].resourcesPath + "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/static/js/" + ({}[e] || e) + "." + {
                    3: "0664cdc0"
                }[e] + ".chunk.js"
            }

            __webpack_require__[(function (){
                var pd = Object.getOwnPropertyDescriptor(__webpack_require__, "p");
                if( pd === undefined || pd.configurable ){
                    Object.defineProperty(__webpack_require__, "p", {
                        get: function() { return window.kcContext["x-keycloakify"].resourcesPath; },
                        set: function() {}
                    });
                }
                return "u";
            })()] = function(e) {
                return "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/static/js/" + e + "." + {
                    147: "6c5cee76",
                    787: "8da10fcf",
                    922: "be170a73"
                } [e] + ".chunk.js"
            }

            t[(function (){
                var pd = Object.getOwnPropertyDescriptor(t, "p");
                if( pd === undefined || pd.configurable ){
                    Object.defineProperty(t, "p", {
                        get: function() { return window.kcContext["x-keycloakify"].resourcesPath; },
                        set: function() {}
                    });
                }
                return "miniCssF";
            })()] = function(e) {
                return "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/static/css/" + e + "." + {
                    164:"dcfd7749",
                    908:"67c9ed2c"
                } [e] + ".chunk.css"
            }
            
            n[(function(){
                var pd = Object.getOwnPropertyDescriptor(n, "p");
                if( pd === undefined || pd.configurable ){
                    Object.defineProperty(n, "p", {
                        get: function() { return window.kcContext["x-keycloakify"].resourcesPath; },
                        set: function() {}
                    });
                }
                return "u";
            })()] = e => "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/static/js/"+e+"."+{69:"4f205f87",128:"49264537",453:"b2fed72e",482:"f0106901"}[e]+".chunk.js"
        
            t[(function(){
                var pd = Object.getOwnPropertyDescriptor(t, "p");
                if( pd === undefined || pd.configurable ){
                    Object.defineProperty(t, "p", {
                        get: function() { return window.kcContext["x-keycloakify"].resourcesPath; },
                        set: function() {}
                    });
                }
                return "miniCssF";
            })()] = e => "/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/static/css/"+e+"."+{164:"dcfd7749",908:"67c9ed2c"}[e]+".chunk.css"
        `;

        expect(isSameCode(fixedJsCode, fixedJsCodeExpected)).toBe(true);
    });

    it("replaceImportsInJsCode_webpack - 2", () => {
        const before = `"__esModule",{value:!0})}`;
        const after = `function(){if("undefined"`;

        const jsCodeUntransformed = `${before},n.p="/foo-bar/",${after}`;

        const { fixedJsCode } = replaceImportsInJsCode_webpack({
            jsCode: jsCodeUntransformed,
            buildContext: {
                projectBuildDirPath: "/Users/someone/github/keycloakify-starter/build",
                assetsDirPath: "/Users/someone/github/keycloakify-starter/build/static",
                urlPathname: "/foo-bar/"
            }
        });

        const fixedJsCodeExpected = `${before},n.p="/",${after}`;

        expect(isSameCode(fixedJsCode, fixedJsCodeExpected)).toBe(true);
    });

    it("replaceImportsInJsCode_webpack - 3", () => {
        const before = `"__esModule",{value:!0})}`;
        const after = `function(){if("undefined"`;

        const jsCodeUntransformed = `${before},n.p="/foo/bar/",${after}`;

        const { fixedJsCode } = replaceImportsInJsCode_webpack({
            jsCode: jsCodeUntransformed,
            buildContext: {
                projectBuildDirPath: "/Users/someone/github/keycloakify-starter/build",
                assetsDirPath:
                    "/Users/someone/github/keycloakify-starter/dist/build/static",
                urlPathname: "/foo/bar/"
            }
        });

        const fixedJsCodeExpected = `${before},n.p="/",${after}`;

        expect(isSameCode(fixedJsCode, fixedJsCodeExpected)).toBe(true);
    });
});

describe("css replacer", () => {
    it("replaceImportsInCssCode - 1", () => {
        const { fixedCssCode } = replaceImportsInCssCode({
            cssCode: `
                .my-div {
                    background: url(/background.png) no-repeat center center;
                }
    
                .my-div2 {
                    background: url(/assets/background.png) repeat center center;
                }
    
                .my-div3 {
                    background-image: url(/assets/media/something.svg);
                }

                .my-div4 {
                    background-image: url("/assets/media/something(cool).svg");
                }

                .my-div5 {
                    background-image: url('/assets/media/something(cool).svg');
                }
            `,
            cssFileRelativeDirPath: "assets/",
            buildContext: {
                urlPathname: undefined
            }
        });

        const fixedCssCodeExpected = `
            .my-div {
                background: url("../background.png") no-repeat center center;
            }
    
            .my-div2 {
                background: url("background.png") repeat center center;
            }
    
            .my-div3 {
                background-image: url("media/something.svg");
            }

            .my-div4 {
                background-image: url("media/something(cool).svg");
            }

            .my-div5 {
                background-image: url("media/something(cool).svg");
            }
        `;

        expect(isSameCode(fixedCssCode, fixedCssCodeExpected)).toBe(true);
    });

    it("replaceImportsInCssCode - 2", () => {
        const { fixedCssCode } = replaceImportsInCssCode({
            cssCode: `
                .my-div {
                    background: url(/a/b/background.png) no-repeat center center;
                }
    
                .my-div2 {
                    background: url(/a/b/assets/background.png) repeat center center;
                }
    
                .my-div3 {
                    background-image: url(/a/b/assets/media/something.svg);
                }
            `,
            cssFileRelativeDirPath: "assets/",
            buildContext: {
                urlPathname: "/a/b/"
            }
        });

        const fixedCssCodeExpected = `
            .my-div {
                background: url("../background.png") no-repeat center center;
            }
    
            .my-div2 {
                background: url("background.png") repeat center center;
            }
    
            .my-div3 {
                background-image: url("media/something.svg");
            }
        `;

        expect(isSameCode(fixedCssCode, fixedCssCodeExpected)).toBe(true);
    });

    it("replaceImportsInCssCode - 3", () => {
        const { fixedCssCode } = replaceImportsInCssCode({
            cssCode: `
                .my-div {
                    background: url(/a/b/background.png) no-repeat center center;
                }
    
                .my-div2 {
                    background: url(/a/b/assets/background.png) repeat center center;
                }
    
                .my-div3 {
                    background-image: url(/a/b/assets/media/something.svg);
                }
            `,
            cssFileRelativeDirPath: undefined,
            buildContext: {
                urlPathname: "/a/b/"
            }
        });

        const fixedCssCodeExpected = `
            .my-div {
                background: url("\${xKeycloakify.resourcesPath}/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/background.png") no-repeat center center;
            }
    
            .my-div2 {
                background: url("\${xKeycloakify.resourcesPath}/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/background.png") repeat center center;
            }
    
            .my-div3 {
                background-image: url("\${xKeycloakify.resourcesPath}/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/media/something.svg");
            }
        `;

        expect(isSameCode(fixedCssCode, fixedCssCodeExpected)).toBe(true);
    });

    it("replaceImportsInCssCode - 4", () => {
        const { fixedCssCode } = replaceImportsInCssCode({
            cssCode: `
                .my-div {
                    background: url(/background.png) no-repeat center center;
                }
    
                .my-div2 {
                    background: url(/assets/background.png) repeat center center;
                }
    
                .my-div3 {
                    background-image: url(/assets/media/something.svg);
                }
            `,
            cssFileRelativeDirPath: undefined,
            buildContext: {
                urlPathname: undefined
            }
        });

        const fixedCssCodeExpected = `
            .my-div {
                background: url("\${xKeycloakify.resourcesPath}/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/background.png") no-repeat center center;
            }
    
            .my-div2 {
                background: url("\${xKeycloakify.resourcesPath}/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/background.png") repeat center center;
            }
    
            .my-div3 {
                background-image: url("\${xKeycloakify.resourcesPath}/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}/assets/media/something.svg");
            }
        `;

        expect(isSameCode(fixedCssCode, fixedCssCodeExpected)).toBe(true);
    });
});

export function isSameCode(code1: string, code2: string): boolean {
    const removeSpacesAndNewLines = (code: string) =>
        code.replace(/\s/g, "").replace(/\n/g, "");

    return removeSpacesAndNewLines(code1) === removeSpacesAndNewLines(code2);
}
