
import * as st from "scripting-tools";
import { join as pathJoin, basename as pathBasename } from "path";

export function setupSampleReactProject() {

    const sampleReactProjectDirPath = pathJoin(__dirname, "..", "..", "sample_react_project");

    st.execSync(`rm -rf ${sampleReactProjectDirPath}`);
    st.execSync(`mkdir ${sampleReactProjectDirPath}`);

    const url = "https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/sample_build_dir_and_package_json.zip";

    [
        `wget ${url}`,
        ...["unzip", "rm"].map(prg => `${prg} ${pathBasename(url)}`)
    ].forEach(cmd => st.execSync(cmd, { "cwd": sampleReactProjectDirPath }));

    return { sampleReactProjectDirPath };

}