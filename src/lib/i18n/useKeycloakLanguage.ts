
import { createUseGlobalState } from "powerhooks";
import { messages } from "./messages.generated";
import { objectKeys } from "evt/tools/typeSafety/objectKeys";
import { getLanguageLabel } from "./getLanguageLabel";

const availableLanguages = objectKeys(messages["login"]);

export type AvailableLanguages = typeof availableLanguages[number];

export const { useKeycloakLanguage } = createUseGlobalState(
    "keycloakLanguage",
    getKeycloakAvailableLanguageBestGuess,
    { "persistance": "cookies" }
);

/** 
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to. 
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches en is returned.
*/
export function getKeycloakAvailableLanguageBestGuess(
    languageLike: string = navigator.language
): AvailableLanguages {

    const iso2LanguageLike = languageLike.split("-")[0].toLowerCase();

    const language = availableLanguages.find(language =>
        language.toLowerCase().includes(iso2LanguageLike) ||
        getLanguageLabel(language).toLocaleLowerCase() === languageLike.toLocaleLowerCase()
    );

    if (language === undefined && languageLike !== navigator.language) {
        return getKeycloakAvailableLanguageBestGuess(navigator.language);
    }

    return "en";
}

