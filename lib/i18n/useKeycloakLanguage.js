"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestMatchAmongKeycloakAvailableLanguages = exports.useKeycloakLanguage = void 0;
var powerhooks_1 = require("powerhooks");
var login_1 = require("./generated_messages/login");
var objectKeys_1 = require("evt/tools/typeSafety/objectKeys");
var getLanguageLabel_1 = require("./getLanguageLabel");
var keycloakFtlValues_1 = require("../keycloakFtlValues");
var availableLanguages = objectKeys_1.objectKeys(login_1.messages);
exports.useKeycloakLanguage = powerhooks_1.createUseGlobalState("keycloakLanguage", function () {
    var _a, _b;
    return getBestMatchAmongKeycloakAvailableLanguages((_b = (_a = keycloakFtlValues_1.keycloakPagesContext === null || keycloakFtlValues_1.keycloakPagesContext === void 0 ? void 0 : keycloakFtlValues_1.keycloakPagesContext.locale) === null || _a === void 0 ? void 0 : _a["current"]) !== null && _b !== void 0 ? _b : navigator.language);
}, { "persistance": "cookies" }).useKeycloakLanguage;
/**
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to: "fr".
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches "en" is returned.
*/
function getBestMatchAmongKeycloakAvailableLanguages(languageLike) {
    var iso2LanguageLike = languageLike.split("-")[0].toLowerCase();
    var language = availableLanguages.find(function (language) {
        return language.toLowerCase().includes(iso2LanguageLike) ||
            getLanguageLabel_1.getLanguageLabel(language).toLocaleLowerCase() === languageLike.toLocaleLowerCase();
    });
    if (language === undefined && languageLike !== navigator.language) {
        return getBestMatchAmongKeycloakAvailableLanguages(navigator.language);
    }
    return "en";
}
exports.getBestMatchAmongKeycloakAvailableLanguages = getBestMatchAmongKeycloakAvailableLanguages;
//# sourceMappingURL=useKeycloakLanguage.js.map