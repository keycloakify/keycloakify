"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestMatchAmongKcLanguageTag = exports.kcLanguageTags = exports.getKcLanguageTagLabel = void 0;
var objectKeys_1 = require("tsafe/objectKeys");
var login_1 = require("./kcMessages/login");
var kcLanguageByTagLabel = {
    /* spell-checker: disable */
    "es": "Español",
    "it": "Italiano",
    "fr": "Français",
    "ca": "Català",
    "en": "English",
    "de": "Deutsch",
    "no": "Norsk",
    "pt-BR": "Português (Brasil)",
    "ru": "Русский",
    "sk": "Slovenčina",
    "ja": "日本語",
    "pl": "Polski",
    "zh-CN": "中文简体",
    "sv": "Svenska",
    "lt": "Lietuvių",
    "cs": "Čeština",
    "nl": "Nederlands",
    "tr": "Türkçe",
    "da": "Dansk",
    "hu": "Magyar",
    /* spell-checker: enable */
};
function getKcLanguageTagLabel(language) {
    var _a;
    return (_a = kcLanguageByTagLabel[language]) !== null && _a !== void 0 ? _a : language;
}
exports.getKcLanguageTagLabel = getKcLanguageTagLabel;
exports.kcLanguageTags = (0, objectKeys_1.objectKeys)(login_1.kcMessages);
/**
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to: "fr".
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches "en" is returned.
 */
function getBestMatchAmongKcLanguageTag(languageLike) {
    var iso2LanguageLike = languageLike.split("-")[0].toLowerCase();
    var kcLanguageTag = exports.kcLanguageTags.find(function (language) {
        return language.toLowerCase().includes(iso2LanguageLike) ||
            getKcLanguageTagLabel(language).toLocaleLowerCase() === languageLike.toLocaleLowerCase();
    });
    if (kcLanguageTag !== undefined) {
        return kcLanguageTag;
    }
    if (languageLike !== navigator.language) {
        return getBestMatchAmongKcLanguageTag(navigator.language);
    }
    return "en";
}
exports.getBestMatchAmongKcLanguageTag = getBestMatchAmongKcLanguageTag;
//# sourceMappingURL=KcLanguageTag.js.map