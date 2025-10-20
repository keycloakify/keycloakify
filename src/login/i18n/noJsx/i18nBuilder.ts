import type {
    LanguageTag as LanguageTag_defaultSet,
    MessageKey as MessageKey_defaultSet
} from "../messages_defaultSet/types";
import {
    type ReturnTypeOfCreateGetI18n,
    type MessageFormatter as MessageFormatter_I18n,
    createGetI18n
} from "./getI18n";

export type I18nBuilder<
    ThemeName extends string = never,
    MessageKey_themeDefined extends string = never,
    LanguageTag_notInDefaultSet extends string = never,
    MessageFormatter extends MessageFormatter_I18n = never,
    ExcludedMethod extends
        | "withThemeName"
        | "withExtraLanguages"
        | "withCustomTranslations"
        | "withMessageFormatter" = never
> = Omit<
    {
        withThemeName: <ThemeName extends string>() => I18nBuilder<
            ThemeName,
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet,
            MessageFormatter,
            ExcludedMethod | "withThemeName"
        >;
        withExtraLanguages: <
            LanguageTag_notInDefaultSet extends string
        >(extraLanguageTranslations: {
            [LanguageTag in LanguageTag_notInDefaultSet]: {
                label: string;
                getMessages: () => Promise<{
                    default: Record<MessageKey_defaultSet, string>;
                }>;
            };
        }) => I18nBuilder<
            ThemeName,
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet,
            MessageFormatter,
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
        ) => I18nBuilder<
            ThemeName,
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet,
            MessageFormatter,
            ExcludedMethod | "withCustomTranslations"
        >;
        withMessageFormatter: (
            formatter: (message: string, args: (string | undefined)[]) => string
        ) => I18nBuilder<
            ThemeName,
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet,
            MessageFormatter,
            ExcludedMethod | "withMessageFormatter"
        >;
        build: () => ReturnTypeOfCreateGetI18n<
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet
        >;
    },
    ExcludedMethod
>;

function createI18nBuilder<
    ThemeName extends string = never,
    MessageKey_themeDefined extends string = never,
    LanguageTag_notInDefaultSet extends string = never,
    MessageFormatter extends MessageFormatter_I18n = never
>(params: {
    extraLanguageTranslations: {
        [LanguageTag in LanguageTag_notInDefaultSet]: {
            label: string;
            getMessages: () => Promise<{
                default: Record<MessageKey_defaultSet, string>;
            }>;
        };
    };
    messagesByLanguageTag_themeDefined: Partial<{
        [LanguageTag in LanguageTag_defaultSet | LanguageTag_notInDefaultSet]: Record<
            MessageKey_themeDefined,
            string | Record<ThemeName, string>
        >;
    }>;
    messageFormatter?: MessageFormatter;
}): I18nBuilder<
    ThemeName,
    MessageKey_themeDefined,
    LanguageTag_notInDefaultSet,
    MessageFormatter
> {
    const i18nBuilder: I18nBuilder<
        ThemeName,
        MessageKey_themeDefined,
        LanguageTag_notInDefaultSet,
        MessageFormatter
    > = {
        withThemeName: () =>
            createI18nBuilder({
                extraLanguageTranslations: params.extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined as any
            }),
        withExtraLanguages: extraLanguageTranslations =>
            createI18nBuilder({
                extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined as any
            }),
        withCustomTranslations: messagesByLanguageTag_themeDefined =>
            createI18nBuilder({
                extraLanguageTranslations: params.extraLanguageTranslations,
                messagesByLanguageTag_themeDefined
            }),
        withMessageFormatter: formatter =>
            createI18nBuilder({
                extraLanguageTranslations: params.extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined,
                messageFormatter: formatter
            }),
        build: () =>
            createGetI18n({
                extraLanguageTranslations: params.extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined,
                messageFormatter: params.messageFormatter
            })
    };

    return i18nBuilder;
}

export const i18nBuilder = createI18nBuilder({
    extraLanguageTranslations: {},
    messagesByLanguageTag_themeDefined: {}
});
