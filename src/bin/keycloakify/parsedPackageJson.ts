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
        /** @deprecated: use extraLoginPages instead */
        extraPages?: string[];
        extraLoginPages?: string[];
        extraAccountPages?: string[];
        extraThemeProperties?: string[];
        areAppAndKeycloakServerSharingSameDomain?: boolean;
        artifactId?: string;
        groupId?: string;
        bundler?: Bundler;
        keycloakVersionDefaultAssets?: string;
        reactAppBuildDirPath?: string;
        keycloakifyBuildDirPath?: string;
        customUserAttributes?: string[];
        themeName?: string;
        keepBuildDir?: boolean;
    };
};

export const zParsedPackageJson = z.object({
    "name": z.string(),
    "version": z.string().optional(),
    "homepage": z.string().optional(),
    "keycloakify": z
        .object({
            "extraPages": z.array(z.string()).optional(),
            "extraLoginPages": z.array(z.string()).optional(),
            "extraAccountPages": z.array(z.string()).optional(),
            "extraThemeProperties": z.array(z.string()).optional(),
            "areAppAndKeycloakServerSharingSameDomain": z.boolean().optional(),
            "artifactId": z.string().optional(),
            "groupId": z.string().optional(),
            "bundler": z.enum(bundlers).optional(),
            "keycloakVersionDefaultAssets": z.string().optional(),
            "reactAppBuildDirPath": z.string().optional(),
            "keycloakifyBuildDirPath": z.string().optional(),
            "customUserAttributes": z.array(z.string()).optional(),
            "themeName": z.string().optional(),
            "keepBuildDir": z.boolean().optional()
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
