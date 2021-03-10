"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvtKcLanguage = exports.useKcLanguageTag = void 0;
var powerhooks_1 = require("powerhooks");
var KcContext_1 = require("../KcContext");
var KcLanguageTag_1 = require("./KcLanguageTag");
//export const { useKcLanguageTag, evtKcLanguageTag } = createUseGlobalState(
var wrap = powerhooks_1.createUseGlobalState("kcLanguageTag", function () {
    var _a, _b;
    return KcLanguageTag_1.getBestMatchAmongKcLanguageTag((_b = (_a = KcContext_1.kcContext === null || KcContext_1.kcContext === void 0 ? void 0 : KcContext_1.kcContext.locale) === null || _a === void 0 ? void 0 : _a.current) !== null && _b !== void 0 ? _b : navigator.language);
}, { "persistance": "cookie" });
exports.useKcLanguageTag = wrap.useKcLanguageTag;
function getEvtKcLanguage() {
    return wrap.evtKcLanguageTag;
}
exports.getEvtKcLanguage = getEvtKcLanguage;
//# sourceMappingURL=useKcLanguageTag.js.map