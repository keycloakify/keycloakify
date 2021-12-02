"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSampleReactProject = exports.sampleReactProjectDirPath = void 0;
var getProjectRoot_1 = require("../../bin/tools/getProjectRoot");
var path_1 = require("path");
var downloadAndUnzip_1 = require("../../bin/tools/downloadAndUnzip");
exports.sampleReactProjectDirPath = (0, path_1.join)((0, getProjectRoot_1.getProjectRoot)(), "sample_react_project");
function setupSampleReactProject() {
    (0, downloadAndUnzip_1.downloadAndUnzip)({
        "url": "https://github.com/garronej/keycloakify/releases/download/v0.0.1/sample_build_dir_and_package_json.zip",
        "destDirPath": exports.sampleReactProjectDirPath,
    });
}
exports.setupSampleReactProject = setupSampleReactProject;
//# sourceMappingURL=setupSampleReactProject.js.map