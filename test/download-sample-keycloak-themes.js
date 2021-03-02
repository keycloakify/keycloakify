"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var setupSampleReactProject_1 = require("./setupSampleReactProject");
var st = __importStar(require("scripting-tools"));
var path_1 = require("path");
var getProjectRoot_1 = require("../bin/tools/getProjectRoot");
console.log("Running main in " + setupSampleReactProject_1.sampleReactProjectDirPath);
console.log(st.execSync("node " + path_1.join(getProjectRoot_1.getProjectRoot(), "dist", "bin", "download-sample-keycloak-themes"), { "cwd": setupSampleReactProject_1.sampleReactProjectDirPath }));
//# sourceMappingURL=download-sample-keycloak-themes.js.map