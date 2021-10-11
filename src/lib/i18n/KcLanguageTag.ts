import { objectKeys } from "tsafe/objectKeys";
import { kcMessages } from "./kcMessages/login";

export type KcLanguageTag = keyof typeof kcMessages;

const kcLanguageByTagLabel = {
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
} as const;

export type LanguageLabel = typeof kcLanguageByTagLabel[keyof typeof kcLanguageByTagLabel];

export function getKcLanguageTagLabel(language: KcLanguageTag): LanguageLabel {
    return kcLanguageByTagLabel[language] ?? language;
}

const availableLanguages = objectKeys(kcMessages);

/**
 * Pass in "fr-FR" or "français" for example, it will return the AvailableLanguage
 * it corresponds to: "fr".
 * If there is no reasonable match it's guessed from navigator.language.
 * If still no matches "en" is returned.
 */
export function getBestMatchAmongKcLanguageTag(languageLike: string): KcLanguageTag {
    const iso2LanguageLike = languageLike.split("-")[0].toLowerCase();

    const kcLanguageTag = availableLanguages.find(
        language =>
            language.toLowerCase().includes(iso2LanguageLike) ||
            getKcLanguageTagLabel(language).toLocaleLowerCase() === languageLike.toLocaleLowerCase(),
    );

    if (kcLanguageTag !== undefined) {
        return kcLanguageTag;
    }

    if (languageLike !== navigator.language) {
        return getBestMatchAmongKcLanguageTag(navigator.language);
    }

    return "en";
}
