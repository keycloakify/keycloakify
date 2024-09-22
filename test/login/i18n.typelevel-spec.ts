import { i18nBuilder } from "keycloakify/login/i18n";
import { assert, type Equals } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { I18n as I18n_notExtended } from "keycloakify/login/i18n";

const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<"my-theme-1" | "my-theme-2">()
    .withExtraLanguages({
        he: {
            label: "עברית",
            getMessages: () => import("./he")
        }
    })
    .withCustomTranslations({
        en: {
            myCustomKey1: "my-custom-key-1-en",
            myCustomKey2: {
                "my-theme-1": "my-theme-1-en",
                "my-theme-2": "my-theme-2-en"
            }
        },
        he: {
            myCustomKey1: "my-custom-key-1-he",
            myCustomKey2: {
                "my-theme-1": "my-theme-1-xx",
                "my-theme-2": "my-theme-2-xx"
            }
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

{
    const { i18n } = useI18n({ kcContext: Reflect<any>() });

    assert<Equals<typeof i18n, I18n>>;
}

{
    const x = (_i18n: I18n_notExtended) => {};

    x(Reflect<I18n>());
}

{
    const i18n = Reflect<I18n>();

    const got = i18n.currentLanguage.languageTag;

    type Expected =
        | import("keycloakify/login/i18n/messages_defaultSet/types").LanguageTag
        | "he";

    assert<Equals<typeof got, Expected>>;
}

{
    const i18n = Reflect<I18n>();

    const node = i18n.msg("myCustomKey2");

    assert<Equals<typeof node, JSX.Element>>;
}
