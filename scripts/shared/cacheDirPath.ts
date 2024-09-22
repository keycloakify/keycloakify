import { join as pathJoin } from "path";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";

export const cacheDirPath = pathJoin(
    getThisCodebaseRootDirPath(),
    "node_modules",
    ".cache",
    "scripts"
);
