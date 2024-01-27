import { ftlValuesGlobalName } from "../ftlValuesGlobalName";

export function replaceImportsFromStaticInJsCode(params: { jsCode: string; bundler: "vite" | "webpack" }): { fixedJsCode: string } {
    const { jsCode } = params;

    const { fixedJsCode } = (() => {
        switch (params.bundler) {
            case "vite":
                return replaceImportsFromStaticInJsCode_vite({ jsCode });
            case "webpack":
                return replaceImportsFromStaticInJsCode_webpack({ jsCode });
        }
    })();

    return { fixedJsCode };
}

export function replaceImportsFromStaticInJsCode_vite(params: { jsCode: string }): { fixedJsCode: string } {
    const { jsCode } = params;

    const fixedJsCode = jsCode.replace(
        /\.viteFileDeps = \[(.*)\]/g,
        (...args) => `.viteFileDeps = [${args[1]}].map(viteFileDep => window.kcContext.url.resourcesPath.substring(1) + "/build/" + viteFileDep)`
    );

    return { fixedJsCode };
}

export function replaceImportsFromStaticInJsCode_webpack(params: { jsCode: string }): { fixedJsCode: string } {
    const { jsCode } = params;

    const getReplaceArgs = (language: "js" | "css"): Parameters<typeof String.prototype.replace> => [
        new RegExp(`([a-zA-Z_]+)\\.([a-zA-Z]+)=(function\\(([a-z]+)\\){return|([a-z]+)=>)"static\\/${language}\\/"`, "g"),
        (...[, n, u, matchedFunction, eForFunction]) => {
            const isArrowFunction = matchedFunction.includes("=>");
            const e = isArrowFunction ? matchedFunction.replace("=>", "").trim() : eForFunction;

            return `
            ${n}[(function(){
                var pd = Object.getOwnPropertyDescriptor(${n}, "p");
                if( pd === undefined || pd.configurable ){
                    Object.defineProperty(${n}, "p", {
                        get: function() { return window.${ftlValuesGlobalName}.url.resourcesPath; },
                        set: function() {}
                    });
                }
                return "${u}";
            })()] = ${isArrowFunction ? `${e} =>` : `function(${e}) { return `} "/build/static/${language}/"`
                .replace(/\s+/g, " ")
                .trim();
        }
    ];

    const fixedJsCode = jsCode
        .replace(...getReplaceArgs("js"))
        .replace(...getReplaceArgs("css"))
        .replace(/[a-zA-Z]+\.[a-zA-Z]+\+"static\//g, `window.${ftlValuesGlobalName}.url.resourcesPath + "/build/static/`)
        //TODO: Write a test case for this
        .replace(
            /".chunk.css",([a-zA-Z])+=[a-zA-Z]+\.[a-zA-Z]+\+([a-zA-Z]+),/,
            (...[, group1, group2]) => `".chunk.css",${group1} = window.${ftlValuesGlobalName}.url.resourcesPath + "/build/" + ${group2},`
        );

    return { fixedJsCode };
}
