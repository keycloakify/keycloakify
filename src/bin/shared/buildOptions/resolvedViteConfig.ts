import * as fs from "fs";
import { UserProvidedBuildOptions } from "./UserProvidedBuildOptions";
import * as child_process from "child_process";
import { vitePluginSubScriptEnvNames } from "../constants";
import { assert } from "tsafe/assert";

export type ResolvedViteConfig = {
    buildDir: string;
    publicDir: string;
    assetsDir: string;
    urlPathname: string | undefined;
    userProvidedBuildOptions: UserProvidedBuildOptions;
};

export function getResolvedViteConfig(params: { reactAppRootDirPath: string }): {
    resolvedViteConfig: ResolvedViteConfig | undefined;
} {
    const { reactAppRootDirPath } = params;

    if (fs.readdirSync(reactAppRootDirPath).find(fileBasename => fileBasename.startsWith("vite.config")) === undefined) {
        return { "resolvedViteConfig": undefined };
    }

    const output = child_process
        .execSync("npx vite", {
            "cwd": reactAppRootDirPath,
            "env": {
                ...process.env,
                [vitePluginSubScriptEnvNames.resolveViteConfig]: "true"
            }
        })
        .toString("utf8");

    assert(output.includes(vitePluginSubScriptEnvNames.resolveViteConfig), "Seems like the Keycloakify's Vite plugin is not installed.");

    const resolvedViteConfigStr = output.split(vitePluginSubScriptEnvNames.resolveViteConfig).reverse()[0];

    const resolvedViteConfig: ResolvedViteConfig = JSON.parse(resolvedViteConfigStr);

    return { resolvedViteConfig };
}
