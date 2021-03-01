declare const availableLanguages: ("tr" | "no" | "en" | "ca" | "cs" | "de" | "es" | "fr" | "it" | "ja" | "lt" | "nl" | "pl" | "pt_BR" | "ru" | "sk" | "sv" | "zh_CN")[];
export declare type AvailableLanguages = typeof availableLanguages[number];
export declare const useKeycloakLanguage: () => import("powerhooks").UseNamedStateReturnType<"tr" | "no" | "en" | "ca" | "cs" | "de" | "es" | "fr" | "it" | "ja" | "lt" | "nl" | "pl" | "pt_BR" | "ru" | "sk" | "sv" | "zh_CN", "keycloakLanguage">;
/**
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to: "fr".
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches "en" is returned.
*/
export declare function getBestMatchAmongKeycloakAvailableLanguages(languageLike: string): AvailableLanguages;
export {};
