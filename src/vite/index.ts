import { load as cheerioLoad } from "cheerio";
import { ftlValuesGlobalName } from "../bin/keycloakify/ftlValuesGlobalName";
import { generateCssCodeToDefineGlobals, replaceImportsInCssCode } from "../bin/keycloakify/replacers/replaceImportsInCssCode";

// need to be imported from vite/dist/node because of circular dependency error
import type { RenderBuiltAssetUrl, UserConfig } from "vite/dist/node";

export function withKeycloakify(config: UserConfig = {}): UserConfig {
    config.plugins = [...(config.plugins ?? []), keycloakify()];

    config.define = {
        ...config.define,

        // keycloakify expects a process.env becuase it looks for PUBLIC_URL
        // we define the PUBLIC_URL as the base url of the vite config
        "process.env": config.base ? { PUBLIC_URL: config.base } : {}
    };

    config.build = {
        ...config.build,

        // keycloakify expects build dir to be in /build
        outDir: "build",

        // keycloakify expects assets to be in /build/static
        assetsDir: "static",

        // most supported target
        target: "es2015"
    };

    config.experimental = {
        ...config.experimental,
        renderBuiltUrl
    };

    return config;
}

export function keycloakify() {
    let cssGlobalsToDefine = {};

    return {
        name: "keycloakify",
        apply: "build" as const,
        transform: (src: string, id: string) => {
            if (id.endsWith(".css")) {
                const cssResult = replaceImportsInCssCode({ cssCode: src });

                cssGlobalsToDefine = { ...cssGlobalsToDefine, ...cssResult.cssGlobalsToDefine };

                return {
                    code: cssResult.fixedCssCode
                };
            }
        },
        transformIndexHtml(rawHtml: string) {
            const html = rawHtml.replace(/\/assets/g, "${url.resourcesPath}/build/static");

            if (Object.keys(cssGlobalsToDefine).length === 0) {
                return html;
            }

            const cheerio = cheerioLoad(html);

            cheerio("head").prepend(`
                <style>
                ${
                    generateCssCodeToDefineGlobals({
                        cssGlobalsToDefine,
                        buildOptions: {
                            urlPathname: undefined
                        }
                    }).cssCodeToPrependInHead
                }
                </style>
            `);

            return cheerio.html();
        }
    };
}

export const renderBuiltUrl: RenderBuiltAssetUrl = (filename, { hostType }) => {
    if (hostType === "js") {
        return {
            runtime: `window.${ftlValuesGlobalName}.url.resourcesPath + "/build/" + ${JSON.stringify(filename)}`
        };
    }

    return { relative: true };
};
