import "keycloakify/tools/Object.fromEntries";
import { assert } from "tsafe/assert";
import messages_defaultSet_fallbackLanguage from "../messages_defaultSet/en";
import { fetchMessages_defaultSet } from "../messages_defaultSet";
import type { KcContext } from "../../KcContext";
import { FALLBACK_LANGUAGE_TAG } from "keycloakify/bin/shared/constants";
import { id } from "tsafe/id";
import { is } from "tsafe/is";
import { Reflect } from "tsafe/Reflect";
import {
    type LanguageTag as LanguageTag_defaultSet,
    type MessageKey as MessageKey_defaultSet,
    languageTags as languageTags_defaultSet
} from "../messages_defaultSet/types";
import type { GenericI18n_noJsx } from "./GenericI18n_noJsx";

export type KcContextLike = {
    themeName: string;
    locale?: {
        currentLanguageTag: string;
        supported: { languageTag: string; url: string; label: string }[];
    };
    "x-keycloakify": {
        messages: Record<string, string>;
    };
};

assert<KcContext extends KcContextLike ? true : false>();

export type ReturnTypeOfCreateGetI18n<MessageKey_themeDefined extends string, LanguageTag_notInDefaultSet extends string> = {
    getI18n: (params: { kcContext: KcContextLike }) => {
        i18n: GenericI18n_noJsx<MessageKey_defaultSet | MessageKey_themeDefined, LanguageTag_defaultSet | LanguageTag_notInDefaultSet>;
        prI18n_currentLanguage:
            | Promise<GenericI18n_noJsx<MessageKey_defaultSet | MessageKey_themeDefined, LanguageTag_defaultSet | LanguageTag_notInDefaultSet>>
            | undefined;
    };
    ofTypeI18n: GenericI18n_noJsx<MessageKey_defaultSet | MessageKey_themeDefined, LanguageTag_defaultSet | LanguageTag_notInDefaultSet>;
};

export function createGetI18n<
    ThemeName extends string = string,
    MessageKey_themeDefined extends string = never,
    LanguageTag_notInDefaultSet extends string = never
>(params: {
    extraLanguageTranslations: {
        [languageTag in LanguageTag_notInDefaultSet]: {
            label: string;
            getMessages: () => Promise<{ default: Record<MessageKey_defaultSet, string> }>;
        };
    };
    messagesByLanguageTag_themeDefined: Partial<{
        [languageTag in LanguageTag_defaultSet | LanguageTag_notInDefaultSet]: {
            [key in MessageKey_themeDefined]: string | Record<ThemeName, string>;
        };
    }>;
}): ReturnTypeOfCreateGetI18n<MessageKey_themeDefined, LanguageTag_notInDefaultSet> {
    const { extraLanguageTranslations, messagesByLanguageTag_themeDefined } = params;

    Object.keys(extraLanguageTranslations).forEach(languageTag_notInDefaultSet => {
        if (id<readonly string[]>(languageTags_defaultSet).includes(languageTag_notInDefaultSet)) {
            throw new Error(
                [
                    `Language "${languageTag_notInDefaultSet}" is already in the default set, you don't need to provide your own base translations for it`,
                    `If you want to override some translations for this language, you can use the "withCustomTranslations" method`
                ].join(" ")
            );
        }
    });

    type LanguageTag = LanguageTag_defaultSet | LanguageTag_notInDefaultSet;

    type MessageKey = MessageKey_defaultSet | MessageKey_themeDefined;

    type I18n = GenericI18n_noJsx<MessageKey, LanguageTag>;

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

        {
            const currentLanguageTag = kcContext.locale?.currentLanguageTag ?? FALLBACK_LANGUAGE_TAG;
            const html = document.querySelector("html");
            assert(html !== null);
            html.lang = currentLanguageTag;
        }

        const getLanguageLabel = (languageTag: LanguageTag) => {
            form_user_added_languages: {
                if (!(languageTag in extraLanguageTranslations)) {
                    break form_user_added_languages;
                }
                assert(is<Exclude<LanguageTag, LanguageTag_defaultSet>>(languageTag));

                const entry = extraLanguageTranslations[languageTag];

                return entry.label;
            }

            from_server: {
                if (kcContext.locale === undefined) {
                    break from_server;
                }

                const supportedEntry = kcContext.locale.supported.find(entry => entry.languageTag === languageTag);

                if (supportedEntry === undefined) {
                    break from_server;
                }

                // cspell: disable-next-line
                // from "Espagnol (Español)" we want to extract "Español"
                const match = supportedEntry.label.match(/[^(]+\(([^)]+)\)/);

                if (match !== null) {
                    return match[1];
                }

                return supportedEntry.label;
            }

            // NOTE: This should never happen
            return languageTag;
        };

        const currentLanguage: I18n["currentLanguage"] = (() => {
            const languageTag = id<string>(kcContext.locale?.currentLanguageTag ?? FALLBACK_LANGUAGE_TAG) as LanguageTag;

            return {
                languageTag,
                label: getLanguageLabel(languageTag)
            };
        })();

        const enabledLanguages: I18n["enabledLanguages"] = (() => {
            const enabledLanguages: I18n["enabledLanguages"] = [];

            if (kcContext.locale !== undefined) {
                for (const entry of kcContext.locale.supported ?? []) {
                    const languageTag = id<string>(entry.languageTag) as LanguageTag;

                    enabledLanguages.push({
                        languageTag,
                        label: getLanguageLabel(languageTag),
                        href: entry.url
                    });
                }
            }

            if (enabledLanguages.find(({ languageTag }) => languageTag === currentLanguage.languageTag) === undefined) {
                enabledLanguages.push({
                    languageTag: currentLanguage.languageTag,
                    label: getLanguageLabel(currentLanguage.languageTag),
                    href: "#"
                });
            }

            return enabledLanguages;
        })();

        const { createI18nTranslationFunctions } = createI18nTranslationFunctionsFactory<MessageKey_themeDefined>({
            themeName: kcContext.themeName,
            messages_themeDefined:
                messagesByLanguageTag_themeDefined[currentLanguage.languageTag] ??
                messagesByLanguageTag_themeDefined[id<string>(FALLBACK_LANGUAGE_TAG) as LanguageTag] ??
                (() => {
                    const firstLanguageTag = Object.keys(messagesByLanguageTag_themeDefined)[0];
                    if (firstLanguageTag === undefined) {
                        return undefined;
                    }
                    return messagesByLanguageTag_themeDefined[firstLanguageTag as LanguageTag];
                })(),
            messages_fromKcServer: kcContext["x-keycloakify"].messages
        });

        const isCurrentLanguageFallbackLanguage = currentLanguage.languageTag === FALLBACK_LANGUAGE_TAG;

        const result: Result = {
            i18n: {
                currentLanguage,
                enabledLanguages,
                ...createI18nTranslationFunctions({
                    messages_defaultSet_currentLanguage: isCurrentLanguageFallbackLanguage ? messages_defaultSet_fallbackLanguage : undefined
                }),
                isFetchingTranslations: !isCurrentLanguageFallbackLanguage
            },
            prI18n_currentLanguage: isCurrentLanguageFallbackLanguage
                ? undefined
                : (async () => {
                      const messages_defaultSet_currentLanguage = await (async () => {
                          const currentLanguageTag = currentLanguage.languageTag;

                          const fromDefaultSet = await fetchMessages_defaultSet(currentLanguageTag);

                          const isEmpty = (() => {
                              for (let _key in fromDefaultSet) {
                                  return false;
                              }

                              return true;
                          })();

                          if (isEmpty) {
                              assert(is<Exclude<LanguageTag, LanguageTag_defaultSet>>(currentLanguageTag));

                              const entry = extraLanguageTranslations[currentLanguageTag];

                              assert(entry !== undefined);

                              return entry.getMessages().then(({ default: messages }) => messages);
                          }

                          return fromDefaultSet;
                      })();

                      const i18n_currentLanguage: I18n = {
                          currentLanguage,
                          enabledLanguages,
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

    return {
        getI18n,
        ofTypeI18n: Reflect<I18n>()
    };
}

function createI18nTranslationFunctionsFactory<MessageKey_themeDefined extends string>(params: {
    themeName: string;
    messages_themeDefined: Record<MessageKey_themeDefined, string | Record<string, string>> | undefined;
    messages_fromKcServer: Record<string, string>;
}) {
    const { themeName, messages_themeDefined, messages_fromKcServer } = params;

    function createI18nTranslationFunctions(params: {
        messages_defaultSet_currentLanguage: Partial<Record<MessageKey_defaultSet, string>> | undefined;
    }): Pick<GenericI18n_noJsx<MessageKey_defaultSet | MessageKey_themeDefined, string>, "msgStr" | "advancedMsgStr"> {
        const { messages_defaultSet_currentLanguage } = params;

        function resolveMsg(props: { key: string; args: (string | undefined)[] }): string | undefined {
            const { key, args } = props;

            const message =
                id<Record<string, string | undefined>>(messages_fromKcServer)[key] ??
                (() => {
                    const messageOrMap = id<Record<string, string | Record<string, string> | undefined> | undefined>(messages_themeDefined)?.[key];

                    if (messageOrMap === undefined) {
                        return undefined;
                    }

                    if (typeof messageOrMap === "string") {
                        return messageOrMap;
                    }

                    const message = messageOrMap[themeName];

                    assert(message !== undefined, `No translation for theme variant "${themeName}" for key "${key}"`);

                    return message;
                })() ??
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

                messageWithArgsInjected = messageWithArgsInjected.replace(new RegExp(`\\{${i + startIndex}\\}`, "g"), arg);
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
