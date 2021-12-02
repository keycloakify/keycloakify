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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var getProjectRoot_1 = require("./getProjectRoot");
var path_1 = require("path");
var child_process_1 = __importDefault(require("child_process"));
Object.entries(require((0, path_1.join)((0, getProjectRoot_1.getProjectRoot)(), "package.json"))["bin"]).forEach(function (_a) {
    var _b = __read(_a, 2), scriptPath = _b[1];
    return child_process_1.default.execSync("chmod +x " + scriptPath, {
        "cwd": (0, getProjectRoot_1.getProjectRoot)(),
    });
});
//# sourceMappingURL=grant-exec-perms.js.map