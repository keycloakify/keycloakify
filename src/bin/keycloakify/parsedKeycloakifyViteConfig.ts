import * as fs from "fs";
import { assert } from "tsafe";
import type { Equals } from "tsafe";
import { z } from "zod";
import { pathJoin } from "../tools/pathJoin";
import { keycloakifyViteConfigJsonBasename } from "../constants";
import type { OptionalIfCanBeUndefined } from "../tools/OptionalIfCanBeUndefined";

export type ParsedKeycloakifyViteConfig = {
    reactAppRootDirPath: string;
    publicDirPath: string;
    assetsDirPath: string;
    reactAppBuildDirPath: string;
    urlPathname: string | undefined;
};

export const zParsedKeycloakifyViteConfig = z.object({
    "reactAppRootDirPath": z.string(),
    "publicDirPath": z.string(),
    "assetsDirPath": z.string(),
    "reactAppBuildDirPath": z.string(),
    "urlPathname": z.string().optional()
});

{
    type Got = ReturnType<(typeof zParsedKeycloakifyViteConfig)["parse"]>;
    type Expected = OptionalIfCanBeUndefined<ParsedKeycloakifyViteConfig>;

    assert<Equals<Got, Expected>>();
}

let cache: { parsedKeycloakifyViteConfig: ParsedKeycloakifyViteConfig | undefined } | undefined = undefined;

export function getParsedKeycloakifyViteConfig(params: { keycloakifyBuildDirPath: string }): ParsedKeycloakifyViteConfig | undefined {
    const { keycloakifyBuildDirPath } = params;

    if (cache !== undefined) {
        return cache.parsedKeycloakifyViteConfig;
    }

    const parsedKeycloakifyViteConfig = (() => {
        const keycloakifyViteConfigJsonFilePath = pathJoin(keycloakifyBuildDirPath, keycloakifyViteConfigJsonBasename);

        if (!fs.existsSync(keycloakifyViteConfigJsonFilePath)) {
            return undefined;
        }

        let out: ParsedKeycloakifyViteConfig;

        try {
            out = JSON.parse(fs.readFileSync(keycloakifyViteConfigJsonFilePath).toString("utf8"));
        } catch {
            throw new Error("The output of the Keycloakify Vite plugin is not a valid JSON.");
        }

        try {
            const zodParseReturn = zParsedKeycloakifyViteConfig.parse(out);

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

    if (parsedKeycloakifyViteConfig === undefined && fs.existsSync(pathJoin(keycloakifyBuildDirPath, "vite.config.ts"))) {
        throw new Error("Make sure you have enabled the Keycloakiy plugin in your vite.config.ts");
    }

    cache = { parsedKeycloakifyViteConfig };

    return parsedKeycloakifyViteConfig;
}
