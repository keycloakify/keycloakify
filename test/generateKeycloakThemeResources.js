"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var generateKeycloakThemeResources_1 = require("../bin/build-keycloak-theme/generateKeycloakThemeResources");
var setupSampleReactProject_1 = require("./setupSampleReactProject");
var sampleReactProjectDirPath = setupSampleReactProject_1.setupSampleReactProject().sampleReactProjectDirPath;
generateKeycloakThemeResources_1.generateKeycloakThemeResources({
    "themeName": "onyxia-ui",
    "reactAppBuildDirPath": path_1.join(sampleReactProjectDirPath, "build"),
    "keycloakThemeBuildingDirPath": path_1.join(sampleReactProjectDirPath, "build_keycloak_theme")
});
//# sourceMappingURL=generateKeycloakThemeResources.js.map