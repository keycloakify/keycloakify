import { kcMessages } from "./kcMessages/login";
export declare type KcLanguageTag = keyof typeof kcMessages;
declare const kcLanguageByTagLabel: {
    readonly es: "Español";
    readonly it: "Italiano";
    readonly fr: "Français";
    readonly ca: "Català";
    readonly en: "English";
    readonly de: "Deutsch";
    readonly no: "Norsk";
    readonly "pt-BR": "Português (Brasil)";
    readonly ru: "Русский";
    readonly sk: "Slovenčina";
    readonly ja: "日本語";
    readonly pl: "Polski";
    readonly "zh-CN": "中文简体";
    readonly sv: "Svenska";
    readonly lt: "Lietuvių";
    readonly cs: "Čeština";
    readonly nl: "Nederlands";
    readonly tr: "Türkçe";
    readonly da: "Dansk";
    readonly hu: "Magyar";
};
export declare type LanguageLabel = typeof kcLanguageByTagLabel[keyof typeof kcLanguageByTagLabel];
export declare function getKcLanguageTagLabel(language: KcLanguageTag): LanguageLabel;
export declare const kcLanguageTags: (
    | "tr"
    | "no"
    | "en"
    | "fr"
    | "ca"
    | "cs"
    | "da"
    | "de"
    | "es"
    | "hu"
    | "it"
    | "ja"
    | "lt"
    | "nl"
    | "pl"
    | "pt-BR"
    | "ru"
    | "sk"
    | "sv"
    | "zh-CN"
)[];
/**
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to: "fr".
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches "en" is returned.
 */
export declare function getBestMatchAmongKcLanguageTag(languageLike: string): KcLanguageTag;
export {};
