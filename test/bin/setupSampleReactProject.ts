import { downloadAndUnzip } from "keycloakify/bin/shared/downloadAndUnzip";
import { join as pathJoin } from "path";
import { getThisCodebaseRootDirPath } from "keycloakify/bin/tools/getThisCodebaseRootDirPath";

export async function setupSampleReactProject(destDirPath: string) {
    const thisCodebaseRootDirPath = getThisCodebaseRootDirPath();

    await downloadAndUnzip({
        "url": "https://github.com/keycloakify/keycloakify/releases/download/v0.0.1/sample_build_dir_and_package_json.zip",
        "destDirPath": destDirPath,
        "buildOptions": {
            "cacheDirPath": pathJoin(thisCodebaseRootDirPath, "node_modules", ".cache", "keycloakify"),
            "npmWorkspaceRootDirPath": thisCodebaseRootDirPath
        }
    });
}
