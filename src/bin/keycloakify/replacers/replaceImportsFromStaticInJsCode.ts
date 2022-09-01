import { ftlValuesGlobalName } from "../ftlValuesGlobalName";
import type { BuildOptions } from "../BuildOptions";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import { Reflect } from "tsafe/Reflect";

export type BuildOptionsLike = BuildOptionsLike.Standalone | BuildOptionsLike.ExternalAssets;

export namespace BuildOptionsLike {
    export type Standalone = {
        isStandalone: true;
    };

    export type ExternalAssets = {
        isStandalone: false;
        urlOrigin: string;
    };
}

{
    const buildOptions = Reflect<BuildOptions>();

    assert(!is<BuildOptions.ExternalAssets.CommonExternalAssets>(buildOptions));

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export function replaceImportsFromStaticInJsCode(params: { jsCode: string; buildOptions: BuildOptionsLike }): { fixedJsCode: string } {
    /* 
	NOTE:

	When we have urlOrigin defined it means that 
	we are building with --external-assets
	so we have to make sur that the fixed js code will run 
	inside and outside keycloak.

	When urlOrigin isn't defined we can assume the fixedJsCode
	will always run in keycloak context.
	*/

    const { jsCode, buildOptions } = params;

    const getReplaceArgs = (language: "js" | "css"): Parameters<typeof String.prototype.replace> => [
        new RegExp(`([a-zA-Z]+)\\.([a-zA-Z]+)=function\\(([a-zA-Z]+)\\){return"static\\/${language}\\/"`, "g"),
        (...[, n, u, e]) => `
			${n}[(function(){
                var pd= Object.getOwnPropertyDescriptor(n, "p");
                if( pd === undefined || pd.configurable ){
                ${
                    buildOptions.isStandalone
                        ? `
                        Object.defineProperty(${n}, "p", {
                            get: function() { return window.${ftlValuesGlobalName}.url.resourcesPath; },
                            set: function (){}
                        });
                    `
                        : `
                    var p= "";
                    Object.defineProperty(${n}, "p", {
                        get: function() { return ("${ftlValuesGlobalName}" in window ? "${buildOptions.urlOrigin}" : "") + p; },
                        set: function (value){ p = value;}
                    });
                    `
                }
                }
				return "${u}";
			})()] = function(${e}) { return "${buildOptions.isStandalone ? "/build/" : ""}static/${language}/"`
    ];

    const fixedJsCode = jsCode
        .replace(...getReplaceArgs("js"))
        .replace(...getReplaceArgs("css"))
        .replace(/([a-zA-Z]+\.[a-zA-Z]+)\+"static\//g, (...[, group]) =>
            buildOptions.isStandalone
                ? `window.${ftlValuesGlobalName}.url.resourcesPath + "/build/static/`
                : `("${ftlValuesGlobalName}" in window ? "${buildOptions.urlOrigin}" : "") + ${group} + "static/`
        )
        //TODO: Write a test case for this
        .replace(/".chunk.css",([a-zA-Z])+=([a-zA-Z]+\.[a-zA-Z]+)\+([a-zA-Z]+),/, (...[, group1, group2, group3]) =>
            buildOptions.isStandalone
                ? `".chunk.css",${group1} = window.${ftlValuesGlobalName}.url.resourcesPath + "/build/" + ${group3},`
                : `".chunk.css",${group1} = ("${ftlValuesGlobalName}" in window ? "${buildOptions.urlOrigin}" : "") + ${group2} + ${group3},`
        );

    return { fixedJsCode };
}
