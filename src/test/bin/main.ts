import "./replaceImportFromStatic";
import { setupSampleReactProject, sampleReactProjectDirPath } from "./setupSampleReactProject";
import * as st from "scripting-tools";
import { join as pathJoin } from "path";
import { getProjectRoot } from "../../bin/tools/getProjectRoot.js";

setupSampleReactProject();

const binDirPath = pathJoin(getProjectRoot(), "dist_test", "bin");

st.execSyncTrace(
    //`node ${pathJoin(binDirPath, "keycloakify")} --external-assets`,
    `node ${pathJoin(binDirPath, "keycloakify")}`,
    { "cwd": sampleReactProjectDirPath }
);

st.execSyncTrace(`node ${pathJoin(binDirPath, "download-builtin-keycloak-theme")}`, { "cwd": sampleReactProjectDirPath });
