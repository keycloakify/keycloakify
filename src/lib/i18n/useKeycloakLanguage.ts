
import { createUseGlobalState } from "powerhooks";
import { messages } from "./generated_messages/login";
import { objectKeys } from "evt/tools/typeSafety/objectKeys";
import { getLanguageLabel } from "./getLanguageLabel";
import { keycloakPagesContext } from "../keycloakFtlValues";

const availableLanguages = objectKeys(messages);

export type AvailableLanguages = typeof availableLanguages[number];

export const { useKeycloakLanguage } = createUseGlobalState(
    "keycloakLanguage",
    () => getBestMatchAmongKeycloakAvailableLanguages(
        keycloakPagesContext?.locale?.["current" as never] ??
        navigator.language
    ),
    { "persistance": "cookies" }
);

/** 
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to: "fr". 
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches "en" is returned.
*/
export function getBestMatchAmongKeycloakAvailableLanguages(
    languageLike: string
): AvailableLanguages {

    const iso2LanguageLike = languageLike.split("-")[0].toLowerCase();

    const language = availableLanguages.find(language =>
        language.toLowerCase().includes(iso2LanguageLike) ||
        getLanguageLabel(language).toLocaleLowerCase() === languageLike.toLocaleLowerCase()
    );

    if (language === undefined && languageLike !== navigator.language) {
        return getBestMatchAmongKeycloakAvailableLanguages(navigator.language);
    }

    return "en";
}

