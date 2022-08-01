import "minimal-polyfills/Object.fromEntries";
//NOTE for later: https://github.com/remarkjs/react-markdown/blob/236182ecf30bd89c1e5a7652acaf8d0bf81e6170/src/renderers.js#L7-L35
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type baseMessages from "./generated_messages/18.0.1/login/en";
import { assert } from "tsafe/assert";
import type { KcContextBase } from "../getKcContext/KcContextBase";

export const fallbackLanguageTag = "en";

export type KcContextLike = {
    locale?: {
        currentLanguageTag: string;
        supported: { languageTag: string; url: string; label: string }[];
    };
};

assert<KcContextBase extends KcContextLike ? true : false>();

export type MessageKeyBase = keyof typeof baseMessages | keyof typeof keycloakifyExtraMessages[typeof fallbackLanguageTag];

export type I18n<MessageKey extends string = MessageKeyBase> = {
    msgStr: (key: MessageKey, ...args: (string | undefined)[]) => string;
    msg: (key: MessageKey, ...args: (string | undefined)[]) => JSX.Element;
    /** advancedMsg("${access-denied}") === advancedMsg("access-denied") === msg("access-denied") */
    advancedMsg: (key: string, ...args: (string | undefined)[]) => JSX.Element;
    /** advancedMsg("${not-a-message-key}") === advancedMsg(not-a-message-key") === "not-a-message-key" */
    advancedMsgStr: (key: string, ...args: (string | undefined)[]) => string;
    currentLanguageTag: string;
    changeLocale: (newLanguageTag: string) => never;
    /** e.g. "en" => "English", "fr" => "Français" */
    labelBySupportedLanguageTag: Record<string, string>;
};

export function __unsafe_useI18n<ExtraMessageKey extends string = never>(params: {
    kcContext: KcContextLike;
    extraMessages: { [languageTag: string]: { [key in ExtraMessageKey]: string } };
    doSkip: boolean;
}): I18n<MessageKeyBase | ExtraMessageKey> | null {
    const { kcContext, extraMessages, doSkip } = params;

    const [i18n, setI18n] = useState<I18n<ExtraMessageKey | MessageKeyBase> | undefined>(undefined);

    useEffect(() => {
        if (doSkip) {
            return;
        }

        let isMounted = true;

        (async () => {
            const { currentLanguageTag = fallbackLanguageTag } = kcContext.locale ?? {};

            const [fallbackMessages, messages] = await Promise.all([
                import("./generated_messages/18.0.1/login/en"),
                (() => {
                    switch (currentLanguageTag) {
                        case "ca":
                            return import("./generated_messages/18.0.1/login/ca");
                        case "cs":
                            return import("./generated_messages/18.0.1/login/cs");
                        case "da":
                            return import("./generated_messages/18.0.1/login/da");
                        case "de":
                            return import("./generated_messages/18.0.1/login/de");
                        case "en":
                            return import("./generated_messages/18.0.1/login/en");
                        case "es":
                            return import("./generated_messages/18.0.1/login/es");
                        case "fi":
                            return import("./generated_messages/18.0.1/login/fi");
                        case "fr":
                            return import("./generated_messages/18.0.1/login/fr");
                        case "hu":
                            return import("./generated_messages/18.0.1/login/hu");
                        case "it":
                            return import("./generated_messages/18.0.1/login/it");
                        case "ja":
                            return import("./generated_messages/18.0.1/login/ja");
                        case "lt":
                            return import("./generated_messages/18.0.1/login/lt");
                        case "lv":
                            return import("./generated_messages/18.0.1/login/lv");
                        case "nl":
                            return import("./generated_messages/18.0.1/login/nl");
                        case "no":
                            return import("./generated_messages/18.0.1/login/no");
                        case "pl":
                            return import("./generated_messages/18.0.1/login/pl");
                        case "pt-BR":
                            return import("./generated_messages/18.0.1/login/pt-BR");
                        case "ru":
                            return import("./generated_messages/18.0.1/login/ru");
                        case "sk":
                            return import("./generated_messages/18.0.1/login/sk");
                        case "sv":
                            return import("./generated_messages/18.0.1/login/sv");
                        case "tr":
                            return import("./generated_messages/18.0.1/login/tr");
                        case "zh-CN":
                            return import("./generated_messages/18.0.1/login/zh-CN");
                        default:
                            return {};
                    }
                })(),
            ]);

            if (!isMounted) {
                return;
            }

            setI18n({
                ...createI18nTranslationFunctions({
                    "fallbackMessages": {
                        ...fallbackMessages,
                        ...(keycloakifyExtraMessages[fallbackLanguageTag] ?? {}),
                        ...(extraMessages[fallbackLanguageTag] ?? {}),
                    } as any,
                    "messages": {
                        ...messages,
                        ...((keycloakifyExtraMessages as any)[currentLanguageTag] ?? {}),
                        ...(extraMessages[currentLanguageTag] ?? {}),
                    } as any,
                }),
                currentLanguageTag,
                "changeLocale": newLanguageTag => {
                    const { locale } = kcContext;

                    assert(locale !== undefined, "Internationalization not enabled");

                    const targetSupportedLocale = locale.supported.find(({ languageTag }) => languageTag === newLanguageTag);

                    assert(targetSupportedLocale !== undefined, `${newLanguageTag} need to be enabled in Keycloak admin`);

                    window.location.href = targetSupportedLocale.url;

                    assert(false, "never");
                },
                "labelBySupportedLanguageTag": Object.fromEntries(
                    (kcContext.locale?.supported ?? []).map(({ languageTag, label }) => [languageTag, label]),
                ),
            });
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    return i18n ?? null;
}

const useI18n_private = __unsafe_useI18n;

export function useI18n<ExtraMessageKey extends string = never>(params: {
    kcContext: KcContextLike;
    extraMessages: { [languageTag: string]: { [key in ExtraMessageKey]: string } };
}): I18n<MessageKeyBase | ExtraMessageKey> | null {
    return useI18n_private({
        ...params,
        "doSkip": false,
    });
}

function createI18nTranslationFunctions<MessageKey extends string>(params: {
    fallbackMessages: Record<MessageKey, string>;
    messages: Record<MessageKey, string>;
}): Pick<I18n<MessageKey>, "msg" | "msgStr" | "advancedMsg" | "advancedMsgStr"> {
    const { fallbackMessages, messages } = params;

    function resolveMsg(props: { key: string; args: (string | undefined)[]; doRenderMarkdown: boolean }): string | JSX.Element | undefined {
        const { key, args, doRenderMarkdown } = props;

        const messageOrUndefined: string | undefined = (messages as any)[key] ?? (fallbackMessages as any)[key];

        if (messageOrUndefined === undefined) {
            return undefined;
        }

        const message = messageOrUndefined;

        const messageWithArgsInjectedIfAny = (() => {
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
        })();

        return doRenderMarkdown ? (
            <ReactMarkdown allowDangerousHtml renderers={key === "termsText" ? undefined : { "paragraph": "span" }}>
                {messageWithArgsInjectedIfAny}
            </ReactMarkdown>
        ) : (
            messageWithArgsInjectedIfAny
        );
    }

    function resolveMsgAdvanced(props: { key: string; args: (string | undefined)[]; doRenderMarkdown: boolean }): JSX.Element | string {
        const { key, args, doRenderMarkdown } = props;

        const match = key.match(/^\$\{([^{]+)\}$/);

        const keyUnwrappedFromCurlyBraces = match === null ? key : match[1];

        const out = resolveMsg({
            "key": keyUnwrappedFromCurlyBraces,
            args,
            doRenderMarkdown,
        });

        return (out !== undefined ? out : doRenderMarkdown ? <span>{keyUnwrappedFromCurlyBraces}</span> : keyUnwrappedFromCurlyBraces) as any;
    }

    return {
        "msgStr": (key, ...args) => resolveMsg({ key, args, "doRenderMarkdown": false }) as string,
        "msg": (key, ...args) => resolveMsg({ key, args, "doRenderMarkdown": true }) as JSX.Element,
        "advancedMsg": (key, ...args) => resolveMsgAdvanced({ key, args, "doRenderMarkdown": true }) as JSX.Element,
        "advancedMsgStr": (key, ...args) => resolveMsgAdvanced({ key, args, "doRenderMarkdown": false }) as string,
    };
}

const keycloakifyExtraMessages = {
    "en": {
        "shouldBeEqual": "{0} should be equal to {1}",
        "shouldBeDifferent": "{0} should be different to {1}",
        "shouldMatchPattern": "Pattern should match: `/{0}/`",
        "mustBeAnInteger": "Must be an integer",
        "notAValidOption": "Not a valid option",
    },
    "fr": {
        /* spell-checker: disable */
        "shouldBeEqual": "{0} doit être égal à {1}",
        "shouldBeDifferent": "{0} doit être différent de {1}",
        "shouldMatchPattern": "Dois respecter le schéma: `/{0}/`",
        "mustBeAnInteger": "Doit être un nombre entier",
        "notAValidOption": "N'est pas une option valide",

        "logoutConfirmTitle": "Déconnexion",
        "logoutConfirmHeader": "Êtes-vous sûr(e) de vouloir vous déconnecter ?",
        "doLogout": "Se déconnecter",
        /* spell-checker: enable */
    },
};
