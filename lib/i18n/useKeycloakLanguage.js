"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeycloakAvailableLanguageBestGuess = exports.useKeycloakLanguage = void 0;
var powerhooks_1 = require("powerhooks");
var login_1 = require("./generated_messages/login");
var objectKeys_1 = require("evt/tools/typeSafety/objectKeys");
var getLanguageLabel_1 = require("./getLanguageLabel");
var availableLanguages = objectKeys_1.objectKeys(login_1.messages);
exports.useKeycloakLanguage = powerhooks_1.createUseGlobalState("keycloakLanguage", getKeycloakAvailableLanguageBestGuess, { "persistance": "cookies" }).useKeycloakLanguage;
/**
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to.
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches en is returned.
*/
function getKeycloakAvailableLanguageBestGuess(languageLike) {
    if (languageLike === void 0) { languageLike = navigator.language; }
    var iso2LanguageLike = languageLike.split("-")[0].toLowerCase();
    var language = availableLanguages.find(function (language) {
        return language.toLowerCase().includes(iso2LanguageLike) ||
            getLanguageLabel_1.getLanguageLabel(language).toLocaleLowerCase() === languageLike.toLocaleLowerCase();
    });
    if (language === undefined && languageLike !== navigator.language) {
        return getKeycloakAvailableLanguageBestGuess(navigator.language);
    }
    return "en";
}
exports.getKeycloakAvailableLanguageBestGuess = getKeycloakAvailableLanguageBestGuess;
//# sourceMappingURL=useKeycloakLanguage.js.map