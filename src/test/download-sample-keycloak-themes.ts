
import { sampleReactProjectDirPath } from "./setupSampleReactProject";
import * as st from "scripting-tools";
import { join as pathJoin } from "path";

console.log(`Running main in ${sampleReactProjectDirPath}`);

st.execSync(
    `node ${pathJoin(__dirname, "../bin/download-sample-keycloak-themes")}`,
    { "cwd": sampleReactProjectDirPath }
);


