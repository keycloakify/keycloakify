import * as fs from "fs";
import { assert } from "tsafe";
import type { Equals } from "tsafe";
import { z } from "zod";
import { join as pathJoin } from "path";
import { resolvedViteConfigJsonBasename } from "../../constants";
import type { OptionalIfCanBeUndefined } from "../../tools/OptionalIfCanBeUndefined";
import { UserProvidedBuildOptions, zUserProvidedBuildOptions } from "./UserProvidedBuildOptions";

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

export function readResolvedViteConfig(params: { cacheDirPath: string }): {
    resolvedViteConfig: ResolvedViteConfig | undefined;
} {
    const { cacheDirPath } = params;

    const resolvedViteConfigJsonFilePath = pathJoin(cacheDirPath, resolvedViteConfigJsonBasename);

    if (!fs.existsSync(resolvedViteConfigJsonFilePath)) {
        return { "resolvedViteConfig": undefined };
    }

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
