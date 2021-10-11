import { join as pathJoin } from "path";
import { generateKeycloakThemeResources } from "../../bin/build-keycloak-theme/generateKeycloakThemeResources";
import { setupSampleReactProject, sampleReactProjectDirPath } from "./setupSampleReactProject";

setupSampleReactProject();

generateKeycloakThemeResources({
    "themeName": "keycloakify-demo-app",
    "reactAppBuildDirPath": pathJoin(sampleReactProjectDirPath, "build"),
    "keycloakThemeBuildingDirPath": pathJoin(sampleReactProjectDirPath, "build_keycloak_theme"),
    "urlPathname": "/keycloakify-demo-app/",
    "urlOrigin": undefined,
    "extraPagesId": ["my-custom-page.ftl"],
    "extraThemeProperties": ["env=test"],
    "keycloakVersion": "11.0.3",
});
