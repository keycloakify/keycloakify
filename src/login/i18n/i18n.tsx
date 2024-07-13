import "keycloakify/tools/Object.fromEntries";
import { assert } from "tsafe/assert";
import messages_defaultSet_fallbackLanguage from "./messages_defaultSet/en";
import { fetchMessages_defaultSet } from "./messages_defaultSet";
import type { KcContext } from "../KcContext";
import { fallbackLanguageTag } from "keycloakify/bin/shared/constants";
import { id } from "tsafe/id";

export type KcContextLike = {
    locale?: {
        currentLanguageTag: string;
        supported: { languageTag: string; url: string; label: string }[];
    };
    "x-keycloakify": {
        messages: Record<string, string>;
    };
};

assert<KcContext extends KcContextLike ? true : false>();

export type GenericI18n_noJsx<MessageKey extends string> = {
    /**
     * e.g: "en", "fr", "zh-CN"
     *
     * The current language
     */
    currentLanguageTag: string;
    /**
     * Redirect to this url to change the language.
     * After reload currentLanguageTag === newLanguageTag
     */
    getChangeLocaleUrl: (newLanguageTag: string) => string;
    /**
     * e.g. "en" => "English", "fr" => "Français", ...
     *
     * Used to render a select that enable user to switch language.
     * ex: https://user-images.githubusercontent.com/6702424/186044799-38801eec-4e89-483b-81dd-8e9233e8c0eb.png
     * */
    labelBySupportedLanguageTag: Record<string, string>;
    /**
     *
     * Examples assuming currentLanguageTag === "en"
     * {
     *   en: {
     *     "access-denied": "Access denied",
     *     "impersonateTitleHtml": "<strong>{0}</strong> Impersonate User",
     *     "bar": "Bar {0}"
     *   }
     * }
     *
     * msgStr("access-denied") === "Access denied"
     * msgStr("not-a-message-key") Throws an error
     * msgStr("impersonateTitleHtml", "Foo") === "<strong>Foo</strong> Impersonate User"
     * msgStr("${bar}", "<strong>c</strong>") === "Bar &lt;strong&gt;XXX&lt;/strong&gt;"
     *  The html in the arg is partially escaped for security reasons, it might come from an untrusted source, it's not safe to render it as html.
     */
    msgStr: (key: MessageKey, ...args: (string | undefined)[]) => string;
    /**
     * This is meant to be used when the key argument is variable, something that might have been configured by the user
     * in the Keycloak admin for example.
     *
     * Examples assuming currentLanguageTag === "en"
     * {
     *   en: {
     *     "access-denied": "Access denied",
     *   }
     * }
     *
     * advancedMsgStr("${access-denied}") === advancedMsgStr("access-denied") === msgStr("access-denied") === "Access denied"
     * advancedMsgStr("${not-a-message-key}") === advancedMsgStr("not-a-message-key") === "not-a-message-key"
     */
    advancedMsgStr: (key: string, ...args: (string | undefined)[]) => string;

    /**
     * Initially the messages are in english (fallback language).
     * The translations in the current language are being fetched dynamically.
     * This property is true while the translations are being fetched.
     */
    isFetchingTranslations: boolean;
};

export type MessageKey_defaultSet = keyof typeof messages_defaultSet_fallbackLanguage;

export function createGetI18n<MessageKey_themeDefined extends string = never>(messagesByLanguageTag_themeDefined: {
    [languageTag: string]: { [key in MessageKey_themeDefined]: string };
}) {
    type I18n = GenericI18n_noJsx<MessageKey_defaultSet | MessageKey_themeDefined>;

    type Result = { i18n: I18n; prI18n_currentLanguage: Promise<I18n> | undefined };

    const cachedResultByKcContext = new WeakMap<KcContextLike, Result>();

    function getI18n(params: { kcContext: KcContextLike }): Result {
        const { kcContext } = params;

        use_cache: {
            const cachedResult = cachedResultByKcContext.get(kcContext);

            if (cachedResult === undefined) {
                break use_cache;
            }

            return cachedResult;
        }

        const partialI18n: Pick<I18n, "currentLanguageTag" | "getChangeLocaleUrl" | "labelBySupportedLanguageTag"> = {
            currentLanguageTag: kcContext.locale?.currentLanguageTag ?? fallbackLanguageTag,
            getChangeLocaleUrl: newLanguageTag => {
                const { locale } = kcContext;

                assert(locale !== undefined, "Internationalization not enabled");

                const targetSupportedLocale = locale.supported.find(({ languageTag }) => languageTag === newLanguageTag);

                assert(targetSupportedLocale !== undefined, `${newLanguageTag} need to be enabled in Keycloak admin`);

                return targetSupportedLocale.url;
            },
            labelBySupportedLanguageTag: Object.fromEntries((kcContext.locale?.supported ?? []).map(({ languageTag, label }) => [languageTag, label]))
        };

        const { createI18nTranslationFunctions } = createI18nTranslationFunctionsFactory<MessageKey_themeDefined>({
            messages_themeDefined:
                messagesByLanguageTag_themeDefined[partialI18n.currentLanguageTag] ??
                messagesByLanguageTag_themeDefined[fallbackLanguageTag] ??
                (() => {
                    const firstLanguageTag = Object.keys(messagesByLanguageTag_themeDefined)[0];
                    if (firstLanguageTag === undefined) {
                        return undefined;
                    }
                    return messagesByLanguageTag_themeDefined[firstLanguageTag];
                })(),
            messages_fromKcServer: kcContext["x-keycloakify"].messages
        });

        const isCurrentLanguageFallbackLanguage = partialI18n.currentLanguageTag === fallbackLanguageTag;

        const result: Result = {
            i18n: {
                ...partialI18n,
                ...createI18nTranslationFunctions({
                    messages_defaultSet_currentLanguage: isCurrentLanguageFallbackLanguage ? messages_defaultSet_fallbackLanguage : undefined
                }),
                isFetchingTranslations: !isCurrentLanguageFallbackLanguage
            },
            prI18n_currentLanguage: isCurrentLanguageFallbackLanguage
                ? undefined
                : (async () => {
                      const messages_defaultSet_currentLanguage = await fetchMessages_defaultSet(partialI18n.currentLanguageTag);

                      const i18n_currentLanguage: I18n = {
                          ...partialI18n,
                          ...createI18nTranslationFunctions({ messages_defaultSet_currentLanguage }),
                          isFetchingTranslations: false
                      };

                      // NOTE: This promise.resolve is just because without it we TypeScript
                      // gives a Variable 'result' is used before being assigned. error
                      await Promise.resolve().then(() => {
                          result.i18n = i18n_currentLanguage;
                          result.prI18n_currentLanguage = undefined;
                      });

                      return i18n_currentLanguage;
                  })()
        };

        cachedResultByKcContext.set(kcContext, result);

        return result;
    }

    return { getI18n };
}

function createI18nTranslationFunctionsFactory<MessageKey_themeDefined extends string>(params: {
    messages_themeDefined: Record<MessageKey_themeDefined, string> | undefined;
    messages_fromKcServer: Record<string, string>;
}) {
    const { messages_themeDefined, messages_fromKcServer } = params;

    function createI18nTranslationFunctions(params: {
        messages_defaultSet_currentLanguage: Partial<Record<MessageKey_defaultSet, string>> | undefined;
    }): Pick<GenericI18n_noJsx<MessageKey_defaultSet | MessageKey_themeDefined>, "msgStr" | "advancedMsgStr"> {
        const { messages_defaultSet_currentLanguage } = params;

        function resolveMsg(props: { key: string; args: (string | undefined)[] }): string | undefined {
            const { key, args } = props;

            const message =
                id<Record<string, string | undefined>>(messages_fromKcServer)[key] ??
                id<Record<string, string | undefined> | undefined>(messages_themeDefined)?.[key] ??
                id<Record<string, string | undefined> | undefined>(messages_defaultSet_currentLanguage)?.[key] ??
                id<Record<string, string | undefined>>(messages_defaultSet_fallbackLanguage)[key];

            if (message === undefined) {
                return undefined;
            }

            const startIndex = message
                .match(/{[0-9]+}/g)
                ?.map(g => g.match(/{([0-9]+)}/)![1])
                .map(indexStr => parseInt(indexStr))
                .sort((a, b) => a - b)[0];

            if (startIndex === undefined) {
                // No {0} in message (no arguments expected)
                return message;
            }

            let messageWithArgsInjected = message;

            args.forEach((arg, i) => {
                if (arg === undefined) {
                    return;
                }

                messageWithArgsInjected = messageWithArgsInjected.replace(
                    new RegExp(`\\{${i + startIndex}\\}`, "g"),
                    arg.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                );
            });

            return messageWithArgsInjected;
        }

        function resolveMsgAdvanced(props: { key: string; args: (string | undefined)[] }): string {
            const { key, args } = props;

            const match = key.match(/^\$\{(.+)\}$/);

            return resolveMsg({ key: match !== null ? match[1] : key, args }) ?? key;
        }

        return {
            msgStr: (key, ...args) => {
                const resolvedMessage = resolveMsg({ key, args });
                assert(resolvedMessage !== undefined, `Message with key "${key}" not found`);
                return resolvedMessage;
            },
            advancedMsgStr: (key, ...args) => resolveMsgAdvanced({ key, args })
        };
    }

    return { createI18nTranslationFunctions };
}
