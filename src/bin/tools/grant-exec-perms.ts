import { getThisCodebaseRootDirPath } from "./getThisCodebaseRootDirPath";
import { join as pathJoin } from "path";
import { constants } from "fs";
import { chmod, stat } from "fs/promises";

(async () => {
    const thisCodebaseRootDirPath = getThisCodebaseRootDirPath();

    const { bin } = await import(pathJoin(thisCodebaseRootDirPath, "package.json"));

    const promises = Object.values<string>(bin).map(async scriptPath => {
        const fullPath = pathJoin(thisCodebaseRootDirPath, scriptPath);
        const oldMode = (await stat(fullPath)).mode;
        const newMode = oldMode | constants.S_IXUSR | constants.S_IXGRP | constants.S_IXOTH;
        await chmod(fullPath, newMode);
    });

    await Promise.all(promises);
})();
