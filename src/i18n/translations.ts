import { symToStr } from "tsafe/symToStr";
import { Reflect } from "tsafe/Reflect";
import { id } from "tsafe/id";
import type { Language } from "./useLng";
import { App } from "App";

export type Scheme = {
    [key: string]: undefined | Record<string, string>;
};

type ToTranslations<S extends Scheme> = {
    [key in keyof S]: string;
};

// prettier-ignore
const reflectedI18nSchemes = {
    [symToStr({ App })]: Reflect<App.I18n>(),
};

export type I18nSchemes = typeof reflectedI18nSchemes;

export type Translations = {
    [K in keyof I18nSchemes]: ToTranslations<I18nSchemes[K]>;
};

export const resources = id<Record<Language, Translations>>({
    "en": {
        "App": {
            "documentation": "Documentation",
            "paid for by French taxpayers": "Onyxia is free and open source software payed for by the french tax payers 🇫🇷",
            "pricing": "Pricing",
            "it is libre software": "It is libre software",
            "ok": "Ok"
        },
    },
    "fr": {
        /* spell-checker: disable */
        "App": {
            "documentation": "Documentation",
            "paid for by French taxpayers": "Onyxia est un logiciel libre et gratuit firancer par le contribuable francais. 🇫🇷",
            "pricing": "Prix",
            "it is libre software": "C'est un logiciel libre",
            "ok": "D'accord"
        },
        /* spell-checker: enable */
    },
    "zh-CN": {
        /* spell-checker: disable */
        "App": {
            "documentation": "文档",
            "paid for by French taxpayers": "由法国税收官员支付",
            "pricing": "价格",
            "it is libre software": "这是一个开源软件",
            "ok": "好"
        },
        /* spell-checker: enable */
    },
});
