import { ftlValuesGlobalName } from "../ftlValuesGlobalName";

export function replaceImportsFromStaticInJsCode(params: { jsCode: string }): { fixedJsCode: string } {
    /* 
	NOTE:

	When we have urlOrigin defined it means that 
	we are building with --external-assets
	so we have to make sur that the fixed js code will run 
	inside and outside keycloak.

	When urlOrigin isn't defined we can assume the fixedJsCode
	will always run in keycloak context.
	*/

    const { jsCode } = params;

    const getReplaceArgs = (language: "js" | "css"): Parameters<typeof String.prototype.replace> => [
        new RegExp(`([a-zA-Z_]+)\\.([a-zA-Z]+)=function\\(([a-zA-Z]+)\\){return"static\\/${language}\\/"`, "g"),
        (...[, n, u, e]) => `
			${n}[(function(){
                var pd= Object.getOwnPropertyDescriptor(${n}, "p");
                if( pd === undefined || pd.configurable ){
                    Object.defineProperty(${n}, "p", {
                        get: function() { return window.${ftlValuesGlobalName}.url.resourcesPath; },
                        set: function (){}
                    });
                }
				return "${u}";
			})()] = function(${e}) { return "${true ? "/build/" : ""}static/${language}/"`
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
