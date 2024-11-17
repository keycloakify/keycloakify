import { join as pathJoin } from "path";
import { existsAsync } from "./fs.existsAsync";
import * as child_process from "child_process";
import { assert } from "tsafe/assert";

export async function getInstalledModuleDirPath(params: {
    moduleName: string;
    packageJsonDirPath: string;
    projectDirPath: string;
}) {
    const { moduleName, packageJsonDirPath, projectDirPath } = params;

    common_case: {
        const dirPath = pathJoin(
            ...[packageJsonDirPath, "node_modules", ...moduleName.split("/")]
        );

        if (!(await existsAsync(dirPath))) {
            break common_case;
        }

        return dirPath;
    }

    node_modules_at_root_case: {
        if (projectDirPath === packageJsonDirPath) {
            break node_modules_at_root_case;
        }

        const dirPath = pathJoin(
            ...[projectDirPath, "node_modules", ...moduleName.split("/")]
        );

        if (!(await existsAsync(dirPath))) {
            break node_modules_at_root_case;
        }

        return dirPath;
    }

    const dirPath = child_process
        .execSync(`npm list ${moduleName}`, {
            cwd: packageJsonDirPath
        })
        .toString("utf8")
        .trim();

    assert(dirPath !== "");

    return dirPath;
}
