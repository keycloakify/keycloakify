import { getThisCodebaseRootDirPath } from "./getThisCodebaseRootDirPath";
import { assert } from "tsafe/assert";
import * as fs from "fs";
import { join as pathJoin } from "path";

export function readThisNpmProjectVersion(): string {
    const version = JSON.parse(fs.readFileSync(pathJoin(getThisCodebaseRootDirPath(), "package.json")).toString("utf8"))["version"];

    assert(typeof version === "string");

    return version;
}
