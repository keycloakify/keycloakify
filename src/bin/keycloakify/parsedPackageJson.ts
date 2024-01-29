import * as fs from "fs";
import { assert } from "tsafe";
import type { Equals } from "tsafe";
import { z } from "zod";
import { pathJoin } from "../tools/pathJoin";

export type ParsedPackageJson = {
    name: string;
    version?: string;
    homepage?: string;
    keycloakify?: {
        extraThemeProperties?: string[];
        artifactId?: string;
        groupId?: string;
        doCreateJar?: boolean;
        loginThemeResourcesFromKeycloakVersion?: string;
        reactAppBuildDirPath?: string;
        keycloakifyBuildDirPath?: string;
        themeName?: string | string[];
    };
};

export const zParsedPackageJson = z.object({
    "name": z.string(),
    "version": z.string().optional(),
    "homepage": z.string().optional(),
    "keycloakify": z
        .object({
            "extraThemeProperties": z.array(z.string()).optional(),
            "artifactId": z.string().optional(),
            "groupId": z.string().optional(),
            "doCreateJar": z.boolean().optional(),
            "loginThemeResourcesFromKeycloakVersion": z.string().optional(),
            "reactAppBuildDirPath": z.string().optional(),
            "keycloakifyBuildDirPath": z.string().optional(),
            "themeName": z.union([z.string(), z.array(z.string())]).optional()
        })
        .optional()
});

assert<Equals<ReturnType<(typeof zParsedPackageJson)["parse"]>, ParsedPackageJson>>();

let parsedPackageJson: undefined | ParsedPackageJson;
export function getParsedPackageJson(params: { reactAppRootDirPath: string }) {
    const { reactAppRootDirPath } = params;
    if (parsedPackageJson) {
        return parsedPackageJson;
    }
    parsedPackageJson = zParsedPackageJson.parse(JSON.parse(fs.readFileSync(pathJoin(reactAppRootDirPath, "package.json")).toString("utf8")));
    return parsedPackageJson;
}
