import * as fs from "fs";
import { assert } from "tsafe";
import type { Equals } from "tsafe";
import { z } from "zod";
import { join as pathJoin } from "path";
import type { OptionalIfCanBeUndefined } from "../../tools/OptionalIfCanBeUndefined";
import { UserProvidedBuildOptions, zUserProvidedBuildOptions } from "./UserProvidedBuildOptions";
import * as child_process from "child_process";
import { vitePluginSubScriptEnvNames } from "../constants";

export type ResolvedViteConfig = {
    buildDir: string;
    publicDir: string;
    assetsDir: string;
    urlPathname: string | undefined;
    userProvidedBuildOptions: UserProvidedBuildOptions;
};

const zResolvedViteConfig = z.object({
    "buildDir": z.string(),
    "publicDir": z.string(),
    "assetsDir": z.string(),
    "urlPathname": z.string().optional(),
    "userProvidedBuildOptions": zUserProvidedBuildOptions
});

{
    type Got = ReturnType<(typeof zResolvedViteConfig)["parse"]>;
    type Expected = OptionalIfCanBeUndefined<ResolvedViteConfig>;

    assert<Equals<Got, Expected>>();
}

export function getResolvedViteConfig(params: { cacheDirPath: string; reactAppRootDirPath: string }): {
    resolvedViteConfig: ResolvedViteConfig | undefined;
} {
    const { cacheDirPath, reactAppRootDirPath } = params;

    const resolvedViteConfigJsonFilePath = pathJoin(cacheDirPath, "vite.json");

    if (fs.readdirSync(reactAppRootDirPath).find(fileBasename => fileBasename.startsWith("vite.config")) === undefined) {
        return { "resolvedViteConfig": undefined };
    }

    child_process.execSync("npx vite", {
        "cwd": reactAppRootDirPath,
        "env": {
            ...process.env,
            [vitePluginSubScriptEnvNames.createResolvedViteConfig]: resolvedViteConfigJsonFilePath
        }
    });

    const resolvedViteConfig = (() => {
        if (!fs.existsSync(resolvedViteConfigJsonFilePath)) {
            throw new Error("Missing Keycloakify Vite plugin output.");
        }

        let out: ResolvedViteConfig;

        try {
            out = JSON.parse(fs.readFileSync(resolvedViteConfigJsonFilePath).toString("utf8"));
        } catch {
            throw new Error("The output of the Keycloakify Vite plugin is not a valid JSON.");
        }

        try {
            const zodParseReturn = zResolvedViteConfig.parse(out);

            // So that objectKeys from tsafe return the expected result no matter what.
            Object.keys(zodParseReturn)
                .filter(key => !(key in out))
                .forEach(key => {
                    delete (out as any)[key];
                });
        } catch {
            throw new Error("The output of the Keycloakify Vite plugin do not match the expected schema.");
        }

        return out;
    })();

    return { resolvedViteConfig };
}
