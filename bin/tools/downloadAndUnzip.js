"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAndUnzip = void 0;
var path_1 = require("path");
var child_process_1 = __importDefault(require("child_process"));
var fs_1 = __importDefault(require("fs"));
function downloadAndUnzip(params) {
    var url = params.url, destDirPath = params.destDirPath;
    fs_1.default.mkdirSync(destDirPath, { "recursive": true });
    console.log({ url: url, destDirPath: destDirPath });
    __spreadArray([
        "wget " + url
    ], __read(["unzip", "rm"].map(function (prg) { return prg + " " + path_1.basename(url); }))).forEach(function (cmd) { return child_process_1.default.execSync(cmd, { "cwd": destDirPath }); });
}
exports.downloadAndUnzip = downloadAndUnzip;
//# sourceMappingURL=downloadAndUnzip.js.map