import { readPaths } from "keycloakify/bin/keycloakify/generateTheme/readStaticResourcesUsage";
import { same } from "evt/tools/inDepth/same";
import { expect, it, describe } from "vitest";

describe("Ensure it's able to extract used Keycloak resources", () => {
    const expectedPaths = {
        "resourcesCommonFilePaths": [
            "node_modules/patternfly/dist/css/patternfly.min.css",
            "node_modules/patternfly/dist/css/patternfly-additions.min.css",
            "lib/zocial/zocial.css",
            "node_modules/jquery/dist/jquery.min.js"
        ]
    };

    it("works with coding style n°1", () => {
        const paths = readPaths({
            "rawSourceFile": `
            const { isReady } = usePrepareTemplate({
                "doFetchDefaultThemeResources": doUseDefaultCss,
                "styles": [
                    \`\${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly.min.css\`,
                    \`\${
                        url.resourcesCommonPath
                    }/node_modules/patternfly/dist/css/patternfly-additions.min.css\`,
                    \`\${resourcesCommonPath }/lib/zocial/zocial.css\`,
                    \`\${url.resourcesPath}/css/login.css\`
                ],
                "htmlClassName": getClassName("kcHtmlClass"),
                "bodyClassName": undefined
            });

            const { prLoaded, remove } = headInsert({
                "type": "javascript",
                "src": \`\${kcContext.url.resourcesCommonPath}/node_modules/jquery/dist/jquery.min.js\`
            });

            `
        });

        expect(same(paths, expectedPaths)).toBe(true);
    });

    it("works with coding style n°2", () => {
        const paths = readPaths({
            "rawSourceFile": `

            const { isReady } = usePrepareTemplate({
                "doFetchDefaultThemeResources": doUseDefaultCss,
                "styles": [
                    url.resourcesCommonPath + "/node_modules/patternfly/dist/css/patternfly.min.css",
                    url.resourcesCommonPath + '/node_modules/patternfly/dist/css/patternfly-additions.min.css',
                    url.resourcesCommonPath 
                        + "/lib/zocial/zocial.css",
                    url.resourcesPath + 
                        '/css/login.css'
                ],
                "htmlClassName": getClassName("kcHtmlClass"),
                "bodyClassName": undefined
            });

            const { prLoaded, remove } = headInsert({
                "type": "javascript",
                "src": kcContext.url.resourcesCommonPath + "/node_modules/jquery/dist/jquery.min.js\"
            });


             `
        });

        console.log(paths);
        console.log(expectedPaths);

        expect(same(paths, expectedPaths)).toBe(true);
    });

    it("works with coding style n°3", () => {
        const paths = readPaths({
            "rawSourceFile": `

            const { isReady } = usePrepareTemplate({
                "doFetchDefaultThemeResources": doUseDefaultCss,
                "styles": [
                    path.join(resourcesCommonPath,"/node_modules/patternfly/dist/css/patternfly.min.css"),
                    path.join(url.resourcesCommonPath, '/node_modules/patternfly/dist/css/patternfly-additions.min.css'),
                    path.join(url.resourcesCommonPath, 
                        "/lib/zocial/zocial.css"),
                    pathJoin(
                        url.resourcesPath,
                        'css/login.css'
                    )
                ],
                "htmlClassName": getClassName("kcHtmlClass"),
                "bodyClassName": undefined
            });

            const { prLoaded, remove } = headInsert({
                "type": "javascript",
                "src": path.join(kcContext.url.resourcesCommonPath, "/node_modules/jquery/dist/jquery.min.js")
            });


             `
        });

        expect(same(paths, expectedPaths)).toBe(true);
    });
});
