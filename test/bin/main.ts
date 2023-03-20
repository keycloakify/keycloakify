import "./replaceImportFromStatic";
import { setupSampleReactProject, sampleReactProjectDirPath } from "./setupSampleReactProject";
import * as st from "scripting-tools";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { getProjectRoot } from "keycloakify/bin/tools/getProjectRoot.js";

(async () => {
    await setupSampleReactProject();

    const binDirPath = pathJoin(getProjectRoot(), "dist_test", "src", "bin");

    fs.mkdirSync(pathJoin(sampleReactProjectDirPath, "src", "keycloak-theme"), { "recursive": true });

    st.execSyncTrace(`node ${pathJoin(binDirPath, "initialize-email-theme")}`, { "cwd": sampleReactProjectDirPath });

    st.execSyncTrace(
        //`node ${pathJoin(binDirPath, "keycloakify")} --external-assets`,
        `node ${pathJoin(binDirPath, "keycloakify")}`,
        { "cwd": sampleReactProjectDirPath }
    );
})();
