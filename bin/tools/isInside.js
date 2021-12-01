"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInside = void 0;
var path_1 = require("path");
function isInside(params) {
    var dirPath = params.dirPath, filePath = params.filePath;
    return !(0, path_1.relative)(dirPath, filePath).startsWith("..");
}
exports.isInside = isInside;
//# sourceMappingURL=isInside.js.map