import type {
    LanguageTag as LanguageTag_defaultSet,
    MessageKey as MessageKey_defaultSet
} from "../messages_defaultSet/types";
import { type ReturnTypeOfCreateGetI18n, createGetI18n } from "./getI18n";

export type i18nBuilder<
    ThemeName extends string = never,
    MessageKey_themeDefined extends string = never,
    LanguageTag_notInDefaultSet extends string = never,
    ExcludedMethod extends
        | "withThemeName"
        | "withExtraLanguages"
        | "withCustomTranslations" = never
> = Omit<
    {
        withThemeName: <ThemeName extends string>() => i18nBuilder<
            ThemeName,
            MessageKey_themeDefined,
            LanguageTag_notInDefaultSet,
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
        }) => i18nBuilder<
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
        ) => i18nBuilder<
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

function createi18nBuilder<
    ThemeName extends string = never,
    MessageKey_themeDefined extends string = never,
    LanguageTag_notInDefaultSet extends string = never
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
}): i18nBuilder<ThemeName, MessageKey_themeDefined, LanguageTag_notInDefaultSet> {
    const i18nBuilder: i18nBuilder<
        ThemeName,
        MessageKey_themeDefined,
        LanguageTag_notInDefaultSet
    > = {
        withThemeName: () =>
            createi18nBuilder({
                extraLanguageTranslations: params.extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined as any
            }),
        withExtraLanguages: extraLanguageTranslations =>
            createi18nBuilder({
                extraLanguageTranslations,
                messagesByLanguageTag_themeDefined:
                    params.messagesByLanguageTag_themeDefined as any
            }),
        withCustomTranslations: messagesByLanguageTag_themeDefined =>
            createi18nBuilder({
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

    return i18nBuilder;
}

export const i18nBuilder = createi18nBuilder({
    extraLanguageTranslations: {},
    messagesByLanguageTag_themeDefined: {}
});
