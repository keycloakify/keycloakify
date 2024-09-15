import type { LanguageTag as LanguageTag_defaultSet } from "keycloakify/login/i18n/messages_defaultSet/LanguageTag";
import {
    type MessageKey_defaultSet,
    type ReturnTypeOfCreateGetI18n,
    createGetI18n
} from "./i18n";

export type I18nInitializer<
    ThemeName extends string = never,
    MessageKey_themeDefined extends string = never,
    LanguageTag_notInDefaultSet extends string = never,
    ExcludedMethod extends
        | "withThemeName"
        | "withExtraLanguages"
        | "withCustomTranslations" = never
> = Omit<
    {
        withThemeName: <ThemeName extends string>() => I18nInitializer<
            ThemeName,
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet,
            ExcludedMethod | "withThemeName"
        >;
        withExtraLanguages: <
            LanguageTag_notInDefaultSet extends string
        >(extraLanguageTranslations: {
            [LanguageTag in LanguageTag_notInDefaultSet]: () => Promise<
                Record<MessageKey_defaultSet, string>
            >;
        }) => I18nInitializer<
            ThemeName,
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet,
            ExcludedMethod | "withExtraLanguages"
        >;
        withCustomTranslations: <MessageKey_themeDefined extends string>(
            messagesByLanguageTag_themeDefined: Partial<{
                [LanguageTag in
                    | LanguageTag_defaultSet
                    | LanguageTag_notInDefaultSet]: Record<
                    MessageKey_themeDefined,
                    string | Record<ThemeName, string>
                >;
            }>
        ) => I18nInitializer<
            ThemeName,
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet,
            ExcludedMethod | "withCustomTranslations"
        >;
        create: () => ReturnTypeOfCreateGetI18n<
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet
        >;
    },
    ExcludedMethod
>;

function createI18nInitializer<
    ThemeName extends string = never,
    MessageKey_themeDefined extends string = never,
    LanguageTag_notInDefaultSet extends string = never
>(params: {
    extraLanguageTranslations: {
        [LanguageTag in LanguageTag_notInDefaultSet]: () => Promise<
            Record<MessageKey_defaultSet, string>
        >;
    };
    messagesByLanguageTag_themeDefined: Partial<{
        [LanguageTag in LanguageTag_defaultSet | LanguageTag_notInDefaultSet]: Record<
            MessageKey_themeDefined,
            string | Record<ThemeName, string>
        >;
    }>;
}): I18nInitializer<ThemeName, MessageKey_themeDefined, LanguageTag_notInDefaultSet> {
    const i18nInitializer: I18nInitializer<
        ThemeName,
        MessageKey_themeDefined,
        LanguageTag_notInDefaultSet
    > = {
        withThemeName: () =>
            createI18nInitializer({
                extraLanguageTranslations: params.extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined as any
            }),
        withExtraLanguages: extraLanguageTranslations =>
            createI18nInitializer({
                extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined as any
            }),
        withCustomTranslations: messagesByLanguageTag_themeDefined =>
            createI18nInitializer({
                extraLanguageTranslations: params.extraLanguageTranslations,
                messagesByLanguageTag_themeDefined
            }),
        create: () =>
            createGetI18n({
                extraLanguageTranslations: params.extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined
            })
    };

    return i18nInitializer;
}

export const i18nInitializer = createI18nInitializer({});

const i18n = i18nInitializer
    .withThemeName<"my-theme-1" | "my-theme-2">()
    .withExtraLanguages({
        xx: async () => ({}) as any
    })
    .withCustomTranslations({
        en: {
            myCustomKey: {
                "my-theme-1": "my-theme-1-en",
                "my-theme-2": "my-theme-2-en"
            }
        },
        xx: {
            myCustomKey: {
                "my-theme-1": "my-theme-1-xx",
                "my-theme-2": "my-theme-2-xx"
            }
        }
    })
    .create();
