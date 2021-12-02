"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvtKcLanguage = exports.useKcLanguageTag = void 0;
var useGlobalState_1 = require("powerhooks/useGlobalState");
var getKcContextFromWindow_1 = require("../getKcContext/getKcContextFromWindow");
var KcLanguageTag_1 = require("./KcLanguageTag");
//export const { useKcLanguageTag, evtKcLanguageTag } = createUseGlobalState(
var wrap = (0, useGlobalState_1.createUseGlobalState)("kcLanguageTag", function () {
    var _a, _b;
    var kcContext = (0, getKcContextFromWindow_1.getKcContextFromWindow)();
    var languageLike = (_b = (_a = kcContext === null || kcContext === void 0 ? void 0 : kcContext.locale) === null || _a === void 0 ? void 0 : _a.current) !== null && _b !== void 0 ? _b : (typeof navigator === "undefined" ? undefined : navigator.language);
    if (languageLike === undefined) {
        return "en";
    }
    return (0, KcLanguageTag_1.getBestMatchAmongKcLanguageTag)(languageLike);
}, { "persistance": "localStorage" });
exports.useKcLanguageTag = wrap.useKcLanguageTag;
function getEvtKcLanguage() {
    return wrap.evtKcLanguageTag;
}
exports.getEvtKcLanguage = getEvtKcLanguage;
//# sourceMappingURL=useKcLanguageTag.js.map