import { createI18nApi } from "i18nifty";

export const languages= [ "en", "fr", "zh-CN" ] as const;

export type Language = typeof languages[number];

export const fallbackLanguage= "en";

export const { useTranslation } = createI18nApi<
    | typeof import("./App").i18n
>()({
    languages, fallbackLanguage
},{
    "en": {
        "App": {
            "documentation": "Documentation",
            "paid for by French taxpayers": "Keycloakify is free and open source software payed for by the french tax payers.",
            "pricing": "Pricing",
            "it is libre software": "It is libre software",
            "ok": "Ok"
        },
    },
    "fr": {
        /* spell-checker: disable */
        "App": {
            "documentation": "Documentation",
            "paid for by French taxpayers": "Keycloakify est un logiciel libre et gratuit firancer par le contribuable francais.",
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
