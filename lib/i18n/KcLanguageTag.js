"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestMatchAmongKcLanguageTag = exports.getKcLanguageTagLabel = void 0;
var objectKeys_1 = require("evt/tools/typeSafety/objectKeys");
var login_1 = require("./generated_messages/login");
/* spell-checker: enable */
function getKcLanguageTagLabel(language) {
    switch (language) {
        /* spell-checker: disable */
        case "es": return "Español";
        case "it": return "Italiano";
        case "fr": return "Français";
        case "ca": return "Català";
        case "en": return "English";
        case "de": return "Deutsch";
        case "no": return "Norsk";
        case "pt_BR": return "Português (Brasil)";
        case "ru": return "Русский";
        case "sk":
        case "sv": return "Slovenčina";
        case "ja": return "日本語";
        case "pl": return "Polish";
        case "zh_CN": return "中文简体";
        case "sv": return "Svenska";
        case "lt": return "Lietuvių";
        case "cs": return "Čeština";
        case "nl": return "Nederlands";
        case "tr": return "tr";
        /* spell-checker: enable */
    }
    return language;
}
exports.getKcLanguageTagLabel = getKcLanguageTagLabel;
var availableLanguages = objectKeys_1.objectKeys(login_1.messages);
/**
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to: "fr".
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches "en" is returned.
*/
function getBestMatchAmongKcLanguageTag(languageLike) {
    var iso2LanguageLike = languageLike.split("-")[0].toLowerCase();
    var language = availableLanguages.find(function (language) {
        return language.toLowerCase().includes(iso2LanguageLike) ||
            getKcLanguageTagLabel(language).toLocaleLowerCase() === languageLike.toLocaleLowerCase();
    });
    if (language === undefined && languageLike !== navigator.language) {
        return getBestMatchAmongKcLanguageTag(navigator.language);
    }
    return "en";
}
exports.getBestMatchAmongKcLanguageTag = getBestMatchAmongKcLanguageTag;
//# sourceMappingURL=KcLanguageTag.js.map