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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKcTranslation = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var useKcLanguageTag_1 = require("./useKcLanguageTag");
var login_1 = require("./generated_messages/login");
var powerhooks_1 = require("powerhooks");
var id_1 = require("evt/tools/typeSafety/id");
function useKcTranslation() {
    var kcLanguageTag = useKcLanguageTag_1.useKcLanguageTag().kcLanguageTag;
    var tStr = powerhooks_1.useConstCallback(function (key) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var str = (_a = login_1.messages[kcLanguageTag][key]) !== null && _a !== void 0 ? _a : login_1.messages["en"][key];
        args.forEach(function (arg, i) {
            if (arg === undefined) {
                return;
            }
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arg);
        });
        return str;
    });
    var t = powerhooks_1.useConstCallback(id_1.id(function (key) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return jsx_runtime_1.jsx("span", { className: key, dangerouslySetInnerHTML: { "__html": tStr.apply(void 0, __spreadArray([key], __read(args))) } }, void 0);
    }));
    return { t: t, tStr: tStr };
}
exports.useKcTranslation = useKcTranslation;
//# sourceMappingURL=useKcTranslation.js.map