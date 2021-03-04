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
var crawl_1 = require("./crawl");
var id_1 = require("evt/tools/typeSafety/id");
/** Apply a transformation function to every file of directory */
function transformCodebase(params) {
    var e_1, _a;
    var srcDirPath = params.srcDirPath, destDirPath = params.destDirPath, _b = params.transformSourceCode, transformSourceCode = _b === void 0 ? id_1.id(function (_a) {
        var sourceCode = _a.sourceCode;
        return ({ "modifiedSourceCode": sourceCode });
    }) : _b;
    try {
        for (var _c = __values(crawl_1.crawl(srcDirPath)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var file_relative_path = _d.value;
            var filePath = path.join(srcDirPath, file_relative_path);
            var transformSourceCodeResult = transformSourceCode({
                "sourceCode": fs.readFileSync(filePath),
                "filePath": path.join(srcDirPath, file_relative_path)
            });
            if (transformSourceCodeResult === undefined) {
                continue;
            }
            fs.mkdirSync(path.dirname(path.join(destDirPath, file_relative_path)), { "recursive": true });
            var newFileName = transformSourceCodeResult.newFileName, modifiedSourceCode = transformSourceCodeResult.modifiedSourceCode;
            fs.writeFileSync(path.join(path.dirname(path.join(destDirPath, file_relative_path)), newFileName !== null && newFileName !== void 0 ? newFileName : path.basename(file_relative_path)), modifiedSourceCode);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.transformCodebase = transformCodebase;
//# sourceMappingURL=transformCodebase.js.map