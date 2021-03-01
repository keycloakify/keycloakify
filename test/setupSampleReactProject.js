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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSampleReactProject = exports.sampleReactProjectDirPath = void 0;
var getProjectRoot_1 = require("../bin/tools/getProjectRoot");
var st = __importStar(require("scripting-tools"));
var path_1 = require("path");
exports.sampleReactProjectDirPath = path_1.join(getProjectRoot_1.getProjectRoot(), "sample_react_project");
function setupSampleReactProject() {
    st.execSync("rm -rf " + exports.sampleReactProjectDirPath);
    st.execSync("mkdir " + exports.sampleReactProjectDirPath);
    var url = "https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/sample_build_dir_and_package_json.zip";
    __spreadArray([
        "wget " + url
    ], __read(["unzip", "rm"].map(function (prg) { return prg + " " + path_1.basename(url); }))).forEach(function (cmd) { return st.execSync(cmd, { "cwd": exports.sampleReactProjectDirPath }); });
}
exports.setupSampleReactProject = setupSampleReactProject;
//# sourceMappingURL=setupSampleReactProject.js.map