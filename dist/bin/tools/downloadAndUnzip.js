"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAndUnzip = void 0;
var path_1 = require("path");
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var transformCodebase_1 = require("./transformCodebase");
var rm_1 = require("./rm");
/** assert url ends with .zip */
function downloadAndUnzip(params) {
    var url = params.url, destDirPath = params.destDirPath, pathOfDirToExtractInArchive = params.pathOfDirToExtractInArchive;
    var tmpDirPath = (0, path_1.join)(destDirPath, "..", "tmp_xxKdOxnEdx");
    var zipFilePath = (0, path_1.basename)(url);
    (0, rm_1.rm_rf)(tmpDirPath);
    fs_1.default.mkdirSync(tmpDirPath, { "recursive": true });
    (0, child_process_1.execSync)("curl -L " + url + " -o " + zipFilePath, { "cwd": tmpDirPath });
    (0, child_process_1.execSync)("unzip " + zipFilePath + (pathOfDirToExtractInArchive === undefined ? "" : " \"" + pathOfDirToExtractInArchive + "/*\""), {
        "cwd": tmpDirPath,
    });
    (0, rm_1.rm)((0, path_1.basename)(url), { "cwd": tmpDirPath });
    (0, transformCodebase_1.transformCodebase)({
        "srcDirPath": pathOfDirToExtractInArchive === undefined ? tmpDirPath : (0, path_1.join)(tmpDirPath, pathOfDirToExtractInArchive),
        destDirPath: destDirPath,
    });
    (0, rm_1.rm_r)(tmpDirPath);
}
exports.downloadAndUnzip = downloadAndUnzip;
//# sourceMappingURL=downloadAndUnzip.js.map