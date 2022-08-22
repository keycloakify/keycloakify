import { join as pathJoin } from "path";
import { generateKeycloakThemeResources } from "../../bin/keycloakify/generateKeycloakThemeResources";
import { setupSampleReactProject, sampleReactProjectDirPath } from "./setupSampleReactProject";

setupSampleReactProject();

generateKeycloakThemeResources({
    "reactAppBuildDirPath": pathJoin(sampleReactProjectDirPath, "build"),
    "keycloakThemeBuildingDirPath": pathJoin(sampleReactProjectDirPath, "build_keycloak_theme"),
    "keycloakThemeEmailDirPath": pathJoin(sampleReactProjectDirPath, "keycloak_email"),
    "keycloakVersion": "11.0.3",
    "buildOptions": {
        "themeName": "keycloakify-demo-app",
        "extraPages": ["my-custom-page.ftl"],
        "extraThemeProperties": ["env=test"],
        "isStandalone": true,
        "urlPathname": "/keycloakify-demo-app/"
    }
});
