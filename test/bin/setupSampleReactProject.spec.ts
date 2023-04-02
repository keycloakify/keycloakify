import * as fs from "fs";
import { getProjectRoot } from "keycloakify/bin/tools/getProjectRoot.js";
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "keycloakify/bin/tools/downloadAndUnzip";
import { main as initializeEmailTheme } from "keycloakify/bin/initialize-email-theme";
import { it, describe, afterAll, beforeAll, beforeEach, vi } from "vitest";
import { downloadBuiltinKeycloakTheme } from "keycloakify/bin/download-builtin-keycloak-theme";
import { readBuildOptions } from "keycloakify/bin/keycloakify/BuildOptions";

export const sampleReactProjectDirPath = pathJoin(getProjectRoot(), "sample_react_project");

async function setupSampleReactProject(destDir: string) {
    await downloadAndUnzip({
        "url": "https://github.com/keycloakify/keycloakify/releases/download/v0.0.1/sample_build_dir_and_package_json.zip",
        "destDirPath": destDir
    });
}
let parsedPackageJson: Record<string, unknown> = {};
vi.mock("keycloakify/bin/keycloakify/parsed-package-json", async () => ({
    ...((await vi.importActual("keycloakify/bin/keycloakify/parsed-package-json")) as Record<string, unknown>),
    getParsedPackageJson: () => parsedPackageJson
}));

vi.mock("keycloakify/bin/promptKeycloakVersion", async () => ({
    ...((await vi.importActual("keycloakify/bin/promptKeycloakVersion")) as Record<string, unknown>),
    promptKeycloakVersion: () => ({ keycloakVersion: "11.0.3" })
}));

const nativeCwd = process.cwd;

describe("Sample Project", () => {
    beforeAll(() => {
        // Monkey patching the cwd to the app location for the duration of this test
        process.cwd = () => sampleReactProjectDirPath;
    });
    afterAll(() => {
        fs.rmSync(sampleReactProjectDirPath, { "recursive": true });
        process.cwd = nativeCwd;
    });
    beforeEach(() => {
        if (fs.existsSync(sampleReactProjectDirPath)) {
            fs.rmSync(sampleReactProjectDirPath, { "recursive": true });
        }

        fs.mkdirSync(pathJoin(sampleReactProjectDirPath, "src", "keycloak-theme"), { "recursive": true });
        fs.mkdirSync(pathJoin(sampleReactProjectDirPath, "src", "login"), { "recursive": true });
    });
    it(
        "Sets up the project without error",
        async () => {
            await setupSampleReactProject(sampleReactProjectDirPath);
            await initializeEmailTheme();

            const destDirPath = pathJoin(
                readBuildOptions({
                    "isExternalAssetsCliParamProvided": false,
                    "isSilent": true,
                    "projectDirPath": process.cwd()
                }).keycloakifyBuildDirPath,
                "src",
                "main",
                "resources",
                "theme"
            );
            await downloadBuiltinKeycloakTheme({ destDirPath, keycloakVersion: "11.0.3", isSilent: false });
        },
        { timeout: 90000 }
    );
    it(
        "Sets up the project with a custom input and output directory without error",
        async () => {
            parsedPackageJson = {
                "keycloakify": {
                    "reactAppBuildDirPath": "./custom_input/build",
                    "keycloakBuildDir": "./custom_output"
                }
            };
            await setupSampleReactProject(pathJoin(sampleReactProjectDirPath, "custom_input"));
            await initializeEmailTheme();

            const destDirPath = pathJoin(
                readBuildOptions({
                    "isExternalAssetsCliParamProvided": false,
                    "isSilent": true,
                    "projectDirPath": process.cwd()
                }).keycloakifyBuildDirPath,
                "src",
                "main",
                "resources",
                "theme"
            );
            await downloadBuiltinKeycloakTheme({ destDirPath, keycloakVersion: "11.0.3", isSilent: false });
        },
        { timeout: 90000 }
    );
});
