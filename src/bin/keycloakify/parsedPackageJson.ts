import * as fs from "fs";
import { assert } from "tsafe";
import type { Equals } from "tsafe";
import { z } from "zod";
import { pathJoin } from "../tools/pathJoin";

export const bundlers = ["mvn", "keycloakify", "none"] as const;
export type Bundler = (typeof bundlers)[number];
export type ParsedPackageJson = {
    name: string;
    version?: string;
    homepage?: string;
    keycloakify?: {
        extraThemeProperties?: string[];
        areAppAndKeycloakServerSharingSameDomain?: boolean;
        artifactId?: string;
        groupId?: string;
        bundler?: Bundler;
        loginThemeResourcesFromKeycloakVersion?: string;
        reactAppBuildDirPath?: string;
        keycloakifyBuildDirPath?: string;
        themeName?: string;
        extraThemeNames?: string[];
    };
};

export const zParsedPackageJson = z.object({
    "name": z.string(),
    "version": z.string().optional(),
    "homepage": z.string().optional(),
    "keycloakify": z
        .object({
            "extraThemeProperties": z.array(z.string()).optional(),
            "areAppAndKeycloakServerSharingSameDomain": z.boolean().optional(),
            "artifactId": z.string().optional(),
            "groupId": z.string().optional(),
            "bundler": z.enum(bundlers).optional(),
            "loginThemeResourcesFromKeycloakVersion": z.string().optional(),
            "reactAppBuildDirPath": z.string().optional(),
            "keycloakifyBuildDirPath": z.string().optional(),
            "themeName": z.string().optional(),
            "extraThemeNames": z.array(z.string()).optional()
        })
        .optional()
});

assert<Equals<ReturnType<(typeof zParsedPackageJson)["parse"]>, ParsedPackageJson>>();

let parsedPackageJson: undefined | ReturnType<(typeof zParsedPackageJson)["parse"]>;
export function getParsedPackageJson(params: { projectDirPath: string }) {
    const { projectDirPath } = params;
    if (parsedPackageJson) {
        return parsedPackageJson;
    }
    parsedPackageJson = zParsedPackageJson.parse(JSON.parse(fs.readFileSync(pathJoin(projectDirPath, "package.json")).toString("utf8")));
    return parsedPackageJson;
}
