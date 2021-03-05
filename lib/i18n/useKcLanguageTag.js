"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKcLanguageTag = void 0;
var powerhooks_1 = require("powerhooks");
var kcContext_1 = require("../kcContext");
var KcLanguageTag_1 = require("./KcLanguageTag");
exports.useKcLanguageTag = powerhooks_1.createUseGlobalState("kcLanguageTag", function () {
    var _a, _b;
    return KcLanguageTag_1.getBestMatchAmongKcLanguageTag((_b = (_a = kcContext_1.kcContext === null || kcContext_1.kcContext === void 0 ? void 0 : kcContext_1.kcContext.locale) === null || _a === void 0 ? void 0 : _a["current"]) !== null && _b !== void 0 ? _b : navigator.language);
}, { "persistance": "cookie" }).useKcLanguageTag;
//# sourceMappingURL=useKcLanguageTag.js.map