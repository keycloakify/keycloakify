"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAndUnzip = void 0;
var path_1 = require("path");
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var transformCodebase_1 = require("../tools/transformCodebase");
/** assert url ends with .zip */
function downloadAndUnzip(params) {
    var url = params.url, destDirPath = params.destDirPath;
    var tmpDirPath = path_1.join(destDirPath, "..", "tmp_xxKdOxnEdx");
    child_process_1.execSync("rm -rf " + tmpDirPath);
    fs_1.default.mkdirSync(tmpDirPath, { "recursive": true });
    child_process_1.execSync("wget " + url, { "cwd": tmpDirPath });
    child_process_1.execSync("unzip " + path_1.basename(url), { "cwd": tmpDirPath });
    child_process_1.execSync("rm " + path_1.basename(url), { "cwd": tmpDirPath });
    transformCodebase_1.transformCodebase({
        "srcDirPath": tmpDirPath,
        "destDirPath": destDirPath,
    });
    child_process_1.execSync("rm -r " + tmpDirPath);
}
exports.downloadAndUnzip = downloadAndUnzip;
//# sourceMappingURL=downloadAndUnzip.js.map