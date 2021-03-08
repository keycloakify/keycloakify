import { messages } from "./generated_messages/login";
export declare type KcLanguageTag = keyof typeof messages;
export declare type LanguageLabel = "Deutsch" | "Norsk" | "Русский" | "Svenska" | "Português (Brasil)" | "Lietuvių" | "English" | "Italiano" | "Français" | "中文简体" | "Español" | "Čeština" | "日本語" | "Slovenčina" | "Polski" | "Català" | "Nederlands" | "Türkçe";
export declare function getKcLanguageTagLabel(language: KcLanguageTag): LanguageLabel;
/**
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to: "fr".
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches "en" is returned.
*/
export declare function getBestMatchAmongKcLanguageTag(languageLike: string): KcLanguageTag;
