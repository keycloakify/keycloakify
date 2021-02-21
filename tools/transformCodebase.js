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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformCodebase = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var crawl_1 = require("denoify/tools/crawl");
var createDirectoryIfNotExistsRecursive_1 = require("denoify/tools/createDirectoryIfNotExistsRecursive");
/** Apply a transformation function to every file of directory */
function transformCodebase(params) {
    var e_1, _a;
    var srcDirPath = params.srcDirPath, destDirPath = params.destDirPath, transformSourceCodeString = params.transformSourceCodeString;
    try {
        for (var _b = __values(crawl_1.crawl(srcDirPath)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var file_relative_path = _c.value;
            var filePath = path.join(srcDirPath, file_relative_path);
            var transformSourceCodeStringResult = transformSourceCodeString({
                "sourceCode": fs.readFileSync(filePath),
                "filePath": path.join(srcDirPath, file_relative_path)
            });
            if (transformSourceCodeStringResult === undefined) {
                continue;
            }
            createDirectoryIfNotExistsRecursive_1.createDirectoryIfNotExistsRecursive(path.dirname(path.join(destDirPath, file_relative_path)));
            var newFileName = transformSourceCodeStringResult.newFileName, modifiedSourceCode = transformSourceCodeStringResult.modifiedSourceCode;
            fs.writeFileSync(path.join(path.dirname(path.join(destDirPath, file_relative_path)), newFileName !== null && newFileName !== void 0 ? newFileName : path.basename(file_relative_path)), modifiedSourceCode);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.transformCodebase = transformCodebase;
//# sourceMappingURL=transformCodebase.js.map