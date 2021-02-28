
import {
    setupSampleReactProject, 
    sampleReactProjectDirPath
} from "./setupSampleReactProject";
import * as st from "scripting-tools";
import { join as pathJoin } from "path";
import { getProjectRoot } from "../bin/tools/getProjectRoot";


setupSampleReactProject();


console.log(`Running main in ${sampleReactProjectDirPath}`);

console.log(
    st.execSync(
        `node ${pathJoin(getProjectRoot(), "dist", "bin", "build-keycloak-theme")}`,
        { "cwd": sampleReactProjectDirPath }
    )
);



