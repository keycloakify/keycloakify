import { getProjectRoot } from "./getProjectRoot";
import { join as pathJoin } from "path";
import { constants } from "fs";
import { chmod, stat } from "fs/promises";

async () => {
    var { bin } = await import(pathJoin(getProjectRoot(), "package.json"));

    var promises = Object.values<string>(bin).map(async scriptPath => {
        const fullPath = pathJoin(getProjectRoot(), scriptPath);
        const oldMode = (await stat(fullPath)).mode;
        const newMode = oldMode | constants.S_IXUSR | constants.S_IXGRP | constants.S_IXOTH;
        await chmod(fullPath, newMode);
    });

    await Promise.all(promises);
};
