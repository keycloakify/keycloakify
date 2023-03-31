import { downloadAndUnzip } from "keycloakify/bin/tools/downloadAndUnzip";

export async function setupSampleReactProject(destDirPath: string) {
    await downloadAndUnzip({
        "url": "https://github.com/keycloakify/keycloakify/releases/download/v0.0.1/sample_build_dir_and_package_json.zip",
        "destDirPath": destDirPath
    });
}
