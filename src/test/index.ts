

import {
    setupSampleReactProject,
    sampleReactProjectDirPath
} from "./setupSampleReactProject";
import * as st from "scripting-tools";
import { join as pathJoin } from "path";
import { getProjectRoot } from "../bin/tools/getProjectRoot";

setupSampleReactProject();

const binDirPath= pathJoin(getProjectRoot(), "dist", "bin");

st.execSyncTrace(
    //`node ${pathJoin(binDirPath, "build-keycloak-theme")} --external-assets`,
    `node ${pathJoin(binDirPath, "build-keycloak-theme")}`,
    { "cwd": sampleReactProjectDirPath }
);

st.execSyncTrace(
    `node ${pathJoin(binDirPath, "install-builtin-keycloak-themes")}`,
    { "cwd": sampleReactProjectDirPath }
);
