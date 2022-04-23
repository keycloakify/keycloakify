import { createUseGlobalState } from "powerhooks/useGlobalState";
import { assert } from "tsafe/assert";

export const languages = ["fr", "en", "zh-CN"] as const;
export type Language = typeof languages[number];

export const fallbackLanguage = "en";

assert<typeof fallbackLanguage extends Language ? true : false>();

export function getBrowserLng(): Language {
    const iso2LanguageLike = navigator.language.split("-")[0].toLowerCase();

    const lng = languages.find(lng => lng.toLowerCase().includes(iso2LanguageLike));

    if (lng !== undefined) {
        return lng;
    }

    return fallbackLanguage;
}

export const { useLng, evtLng } = createUseGlobalState("lng", getBrowserLng);
