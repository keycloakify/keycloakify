
import { join as pathJoin } from "path";
import { generateKeycloakThemeResources } from "../bin/build-keycloak-theme/generateKeycloakThemeResources";
import { 
    setupSampleReactProject,
    sampleReactProjectDirPath
} from "./setupSampleReactProject";

setupSampleReactProject();

generateKeycloakThemeResources({
    "themeName": "onyxia-ui",
    "reactAppBuildDirPath": pathJoin(sampleReactProjectDirPath, "build"),
    "keycloakThemeBuildingDirPath": pathJoin(sampleReactProjectDirPath, "build_keycloak_theme")
});

