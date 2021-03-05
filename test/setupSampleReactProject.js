"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSampleReactProject = exports.sampleReactProjectDirPath = void 0;
var getProjectRoot_1 = require("../bin/tools/getProjectRoot");
var path_1 = require("path");
var downloadAndUnzip_1 = require("../bin/tools/downloadAndUnzip");
exports.sampleReactProjectDirPath = path_1.join(getProjectRoot_1.getProjectRoot(), "sample_react_project");
function setupSampleReactProject() {
    downloadAndUnzip_1.downloadAndUnzip({
        "url": "https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/sample_build_dir_and_package_json.zip",
        "destDirPath": exports.sampleReactProjectDirPath
    });
}
exports.setupSampleReactProject = setupSampleReactProject;
//# sourceMappingURL=setupSampleReactProject.js.map