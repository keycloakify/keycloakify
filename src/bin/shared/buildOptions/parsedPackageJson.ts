import * as fs from "fs";
import { assert } from "tsafe";
import type { Equals } from "tsafe";
import { z } from "zod";
import { join as pathJoin } from "path";
import { type UserProvidedBuildOptions, zUserProvidedBuildOptions } from "./UserProvidedBuildOptions";

export type ParsedPackageJson = {
    name: string;
    version?: string;
    homepage?: string;
    keycloakify?: UserProvidedBuildOptions;
};

const zParsedPackageJson = z.object({
    "name": z.string(),
    "version": z.string().optional(),
    "homepage": z.string().optional(),
    "keycloakify": zUserProvidedBuildOptions.optional()
});

assert<Equals<ReturnType<(typeof zParsedPackageJson)["parse"]>, ParsedPackageJson>>();

let parsedPackageJson: undefined | ParsedPackageJson;
export function readParsedPackageJson(params: { reactAppRootDirPath: string }) {
    const { reactAppRootDirPath } = params;
    if (parsedPackageJson) {
        return parsedPackageJson;
    }
    parsedPackageJson = zParsedPackageJson.parse(JSON.parse(fs.readFileSync(pathJoin(reactAppRootDirPath, "package.json")).toString("utf8")));
    return parsedPackageJson;
}
