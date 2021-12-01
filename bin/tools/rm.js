"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rm_rf = exports.rm_r = exports.rm = void 0;
var child_process_1 = require("child_process");
function rmInternal(params) {
    var pathToRemove = params.pathToRemove, args = params.args, cwd = params.cwd;
    (0, child_process_1.execSync)("rm " + (args ? "-" + args + " " : "") + pathToRemove.replace(/ /g, "\\ "), cwd !== undefined ? { cwd: cwd } : undefined);
}
function rm(pathToRemove, options) {
    rmInternal({
        pathToRemove: pathToRemove,
        "args": undefined,
        "cwd": options === null || options === void 0 ? void 0 : options.cwd,
    });
}
exports.rm = rm;
function rm_r(pathToRemove, options) {
    rmInternal({
        pathToRemove: pathToRemove,
        "args": "r",
        "cwd": options === null || options === void 0 ? void 0 : options.cwd,
    });
}
exports.rm_r = rm_r;
function rm_rf(pathToRemove, options) {
    rmInternal({
        pathToRemove: pathToRemove,
        "args": "rf",
        "cwd": options === null || options === void 0 ? void 0 : options.cwd,
    });
}
exports.rm_rf = rm_rf;
//# sourceMappingURL=rm.js.map