"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var generateKeycloakThemeResources_1 = require("../../bin/build-keycloak-theme/generateKeycloakThemeResources");
var setupSampleReactProject_1 = require("./setupSampleReactProject");
(0, setupSampleReactProject_1.setupSampleReactProject)();
(0, generateKeycloakThemeResources_1.generateKeycloakThemeResources)({
    "themeName": "keycloakify-demo-app",
    "reactAppBuildDirPath": (0, path_1.join)(setupSampleReactProject_1.sampleReactProjectDirPath, "build"),
    "keycloakThemeBuildingDirPath": (0, path_1.join)(setupSampleReactProject_1.sampleReactProjectDirPath, "build_keycloak_theme"),
    "urlPathname": "/keycloakify-demo-app/",
    "urlOrigin": undefined,
    "extraPagesId": ["my-custom-page.ftl"],
    "extraThemeProperties": ["env=test"],
    "keycloakVersion": "11.0.3",
});
//# sourceMappingURL=generateKeycloakThemeResources.js.map