import * as fs from "fs";
import { assert } from "tsafe";
import type { Equals } from "tsafe";
import { z } from "zod";
import { pathJoin } from "../tools/pathJoin";
import { resolvedViteConfigJsonBasename } from "../constants";
import type { OptionalIfCanBeUndefined } from "../tools/OptionalIfCanBeUndefined";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";

export type ResolvedViteConfig = {
    buildDir: string;
    publicDir: string;
    assetsDir: string;
    urlPathname: string | undefined;
};

const zResolvedViteConfig = z.object({
    "buildDir": z.string(),
    "publicDir": z.string(),
    "assetsDir": z.string(),
    "urlPathname": z.string().optional()
});

{
    type Got = ReturnType<(typeof zResolvedViteConfig)["parse"]>;
    type Expected = OptionalIfCanBeUndefined<ResolvedViteConfig>;

    assert<Equals<Got, Expected>>();
}

export function readResolvedViteConfig(params: {
    reactAppRootDirPath: string;
    parsedPackageJson_keycloakify_keycloakifyBuildDirPath: string | undefined;
}):
    | {
          resolvedViteConfig: ResolvedViteConfig;
      }
    | undefined {
    const { reactAppRootDirPath, parsedPackageJson_keycloakify_keycloakifyBuildDirPath } = params;

    const viteConfigTsFilePath = pathJoin(reactAppRootDirPath, "vite.config.ts");

    if (!fs.existsSync(viteConfigTsFilePath)) {
        return undefined;
    }

    const { keycloakifyBuildDirPath } = getKeycloakifyBuildDirPath({
        reactAppRootDirPath,
        parsedPackageJson_keycloakify_keycloakifyBuildDirPath,
        "bundler": "vite"
    });

    const resolvedViteConfig = (() => {
        const resolvedViteConfigJsonFilePath = pathJoin(keycloakifyBuildDirPath, resolvedViteConfigJsonBasename);

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

export function getKeycloakifyBuildDirPath(params: {
    reactAppRootDirPath: string;
    parsedPackageJson_keycloakify_keycloakifyBuildDirPath: string | undefined;
    bundler: "vite" | "webpack";
}) {
    const { reactAppRootDirPath, parsedPackageJson_keycloakify_keycloakifyBuildDirPath, bundler } = params;

    const keycloakifyBuildDirPath = (() => {
        if (parsedPackageJson_keycloakify_keycloakifyBuildDirPath !== undefined) {
            getAbsoluteAndInOsFormatPath({
                "pathIsh": parsedPackageJson_keycloakify_keycloakifyBuildDirPath,
                "cwd": reactAppRootDirPath
            });
        }

        return pathJoin(
            reactAppRootDirPath,
            `${(() => {
                switch (bundler) {
                    case "vite":
                        return "dist";
                    case "webpack":
                        return "build";
                }
            })()}_keycloak`
        );
    })();

    return { keycloakifyBuildDirPath };
}
