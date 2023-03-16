import { getProjectRoot } from "../../bin/tools/getProjectRoot.js";
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "../../bin/tools/downloadAndUnzip";

export const sampleReactProjectDirPath = pathJoin(getProjectRoot(), "sample_react_project");

export async function setupSampleReactProject() {
    await downloadAndUnzip({
        "url": "https://github.com/InseeFrLab/keycloakify/releases/download/v0.0.1/sample_build_dir_and_package_json.zip",
        "destDirPath": sampleReactProjectDirPath,
        "cacheDirPath": pathJoin(sampleReactProjectDirPath, "build_keycloak", ".cache"),
        "isSilent": false
    });
}
