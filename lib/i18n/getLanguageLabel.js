"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguageLabel = void 0;
function getLanguageLabel(language) {
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
exports.getLanguageLabel = getLanguageLabel;
/* spell-checker: enable */
//# sourceMappingURL=getLanguageLabel.js.map