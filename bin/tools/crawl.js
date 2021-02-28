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
exports.crawl = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
/** List all files in a given directory return paths relative to the dir_path */
exports.crawl = (function () {
    var crawlRec = function (dir_path, paths) {
        var e_1, _a;
        try {
            for (var _b = __values(fs.readdirSync(dir_path)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var file_name = _c.value;
                var file_path = path.join(dir_path, file_name);
                if (fs.lstatSync(file_path).isDirectory()) {
                    crawlRec(file_path, paths);
                    continue;
                }
                paths.push(file_path);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return function crawl(dir_path) {
        var paths = [];
        crawlRec(dir_path, paths);
        return paths.map(function (file_path) { return path.relative(dir_path, file_path); });
    };
})();
//# sourceMappingURL=crawl.js.map