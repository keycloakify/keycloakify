import * as fs from "fs";
import { join as pathJoin } from "path";
import { getThisCodebaseRootDirPath } from "../tools/getThisCodebaseRootDirPath";

export function copyBoilerplate(params: { adminThemeSrcDirPath: string }) {
    const { adminThemeSrcDirPath } = params;

    fs.cpSync(
        pathJoin(
            getThisCodebaseRootDirPath(),
            "src",
            "bin",
            "initialize-admin-theme",
            "src"
        ),
        adminThemeSrcDirPath,
        { recursive: true }
    );
}
