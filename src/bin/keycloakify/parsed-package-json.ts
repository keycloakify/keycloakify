import * as fs from "fs";
import { assert } from "tsafe";
import type { Equals } from "tsafe";
import { z } from "zod";
import { pathJoin } from "../tools/pathJoin";

const reactProjectDirPath = process.cwd();
export const bundlers = ["mvn", "keycloakify", "none"] as const;
export type Bundler = (typeof bundlers)[number];
type ParsedPackageJson = {
    name: string;
    version: string;
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
        appInputPath?: string;
        keycloakBuildPath?: string;
        customUserAttributes?: string[];
    };
};

const zParsedPackageJson = z.object({
    "name": z.string(),
    "version": z.string(),
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
            "appInputPath": z.string().optional(),
            "keycloakBuildPath": z.string().optional(),
            "customUserAttributes": z.array(z.string()).optional()
        })
        .optional()
});

assert<Equals<ReturnType<(typeof zParsedPackageJson)["parse"]>, ParsedPackageJson>>();

let parsedPackageJson: undefined | ReturnType<(typeof zParsedPackageJson)["parse"]>;
export const getParsedPackageJson = () => {
    if (parsedPackageJson) return parsedPackageJson;
    parsedPackageJson = zParsedPackageJson.parse(JSON.parse(fs.readFileSync(pathJoin(reactProjectDirPath, "package.json")).toString("utf8")));
    return parsedPackageJson;
};
