import { getProjectRoot } from "./getProjectRoot";
import { join as pathJoin } from "path";
import { chmodSync, statSync, constants } from "fs";

import(pathJoin(getProjectRoot(), "package.json")).then(({ bin }) => {
    Object.entries<string>(bin).forEach(([, scriptPath]) => {
        const fullPath = pathJoin(getProjectRoot(), scriptPath);
        const newMode = statSync(fullPath).mode | constants.S_IXUSR | constants.S_IXGRP | constants.S_IXOTH;
        chmodSync(fullPath, newMode);
    });
});
