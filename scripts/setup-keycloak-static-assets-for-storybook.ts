import { downloadKeycloakStaticResources } from "../src/bin/keycloakify/generateTheme/downloadKeycloakStaticResources";
import { getProjectRoot } from "../src/bin/tools/getProjectRoot";
import { join as pathJoin } from "path";
import { mockTestingSubDirOfPublicDirBasename } from "../src/bin/mockTestingResourcesPath";
import { defaultKeycloakVersionDefaultAssets } from "../src/bin/keycloakify/BuildOptions";

(async () => {
    await downloadKeycloakStaticResources({
        "isSilent": false,
        "keycloakVersion": defaultKeycloakVersionDefaultAssets,
        "themeType": "login",
        "themeDirPath": pathJoin(getProjectRoot(), ".storybook", "static", mockTestingSubDirOfPublicDirBasename)
    });

    console.log("Done");
})();
