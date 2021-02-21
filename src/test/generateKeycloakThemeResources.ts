
import * as st from "scripting-tools";
import { join as pathJoin } from "path";
import { generateKeycloakThemeResources } from "../bin/generateKeycloakThemeResources";

const cwd= pathJoin(__dirname, "..", "..", "etc_tmp");

st.execSync(`rm -rf ${cwd}`);
st.execSync(`mkdir ${cwd}`);

process.chdir(cwd);

st.execSync("wget https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/build.zip");

st.execSync("unzip build.zip");

st.execSync("rm build.zip");

generateKeycloakThemeResources({
    "themeName": "onyxia-ui",
    "reactAppBuildDirPath": pathJoin(process.cwd(), "build"),
    "keycloakThemeBuildingDirPath": pathJoin(process.cwd(), "keycloak_build")
});

