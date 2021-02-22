
import {
    setupSampleReactProject, 
    sampleReactProjectDirPath
} from "./setupSampleReactProject";
import * as st from "scripting-tools";
import { join as pathJoin } from "path";


setupSampleReactProject();


console.log(`Running main in ${sampleReactProjectDirPath}`);

console.log(
    st.execSync(
        `node ${pathJoin(__dirname, "../bin/build-keycloak-theme")}`,
        { "cwd": sampleReactProjectDirPath }
    )
);



