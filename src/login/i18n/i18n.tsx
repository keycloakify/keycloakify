import "minimal-polyfills/Object.fromEntries";
import { useEffect, useState, useRef } from "react";
import fallbackMessages from "./baseMessages/en";
import { getMessages } from "./baseMessages";
import { assert } from "tsafe/assert";
import type { KcContext } from "../kcContext/KcContext";

export const fallbackLanguageTag = "en";

export type KcContextLike = {
    locale?: {
        currentLanguageTag: string;
        supported: { languageTag: string; url: string; label: string }[];
    };
    __localizationRealmOverridesUserProfile: Record<string, string>;
};

assert<KcContext extends KcContextLike ? true : false>();

export type MessageKey = keyof typeof fallbackMessages | keyof (typeof keycloakifyExtraMessages)[typeof fallbackLanguageTag];

export type GenericI18n<MessageKey extends string> = {
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
    getChangeLocalUrl: (newLanguageTag: string) => string;
    /**
     * e.g. "en" => "English", "fr" => "Français", ...
     *
     * Used to render a select that enable user to switch language.
     * ex: https://user-images.githubusercontent.com/6702424/186044799-38801eec-4e89-483b-81dd-8e9233e8c0eb.png
     * */
    labelBySupportedLanguageTag: Record<string, string>;
    /**
     * Examples assuming currentLanguageTag === "en"
     *
     * msg("access-denied") === <span>Access denied</span>
     * msg("impersonateTitleHtml", "Foo") === <span><strong>Foo</strong> Impersonate User</span>
     */
    msg: (key: MessageKey, ...args: (string | undefined)[]) => JSX.Element;
    /**
     * It's the same thing as msg() but instead of returning a JSX.Element it returns a string.
     * It can be more convenient to manipulate strings but if there are HTML tags it wont render.
     * msgStr("impersonateTitleHtml", "Foo") === "<strong>Foo</strong> Impersonate User"
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
     *     "foo": "Foo {0} {1}",
     *     "bar": "Bar {0}"
     *   }
     * }
     *
     * advancedMsg("${access-denied} foo bar") === <span>{msgStr("access-denied")} foo bar<span> === <span>Access denied foo bar</span>
     * advancedMsg("${access-denied}") === advancedMsg("access-denied") === msg("access-denied") === <span>Access denied</span>
     * advancedMsg("${not-a-message-key}") === advancedMsg(not-a-message-key") === <span>not-a-message-key</span>
     * advancedMsg("${bar}", "<strong>c</strong>")
     *    === <span>{msgStr("bar", "<strong>XXX</strong>")}<span>
     *    === <span>Bar &lt;strong&gt;XXX&lt;/strong&gt;</span> (The html in the arg is partially escaped for security reasons, it might be untrusted)
     * advancedMsg("${foo} xx ${bar}", "a", "b", "c")
     *    === <span>{msgStr("foo", "a", "b")} xx {msgStr("bar")}<span>
     *    === <span>Foo a b xx Bar {0}</span> (The substitution are only applied in the first message)
     */
    advancedMsg: (key: string, ...args: (string | undefined)[]) => JSX.Element;
    /**
     * See advancedMsg() but instead of returning a JSX.Element it returns a string.
     */
    advancedMsgStr: (key: string, ...args: (string | undefined)[]) => string;
};

export type I18n = GenericI18n<MessageKey>;

export function createUseI18n<ExtraMessageKey extends string = never>(extraMessages: {
    [languageTag: string]: { [key in ExtraMessageKey]: string };
}) {
    function useI18n(params: { kcContext: KcContextLike }): GenericI18n<MessageKey | ExtraMessageKey> | null {
        const { kcContext } = params;

        const [i18n, setI18n] = useState<GenericI18n<ExtraMessageKey | MessageKey> | undefined>(undefined);

        const refHasStartedFetching = useRef(false);

        useEffect(() => {
            if (refHasStartedFetching.current) {
                return;
            }

            refHasStartedFetching.current = true;

            (async () => {
                const { currentLanguageTag = fallbackLanguageTag } = kcContext.locale ?? {};

                setI18n({
                    ...createI18nTranslationFunctions({
                        fallbackMessages: {
                            ...fallbackMessages,
                            ...(keycloakifyExtraMessages[fallbackLanguageTag] ?? {}),
                            ...(extraMessages[fallbackLanguageTag] ?? {})
                        } as any,
                        messages: {
                            ...(await getMessages(currentLanguageTag)),
                            ...((keycloakifyExtraMessages as any)[currentLanguageTag] ?? {}),
                            ...(extraMessages[currentLanguageTag] ?? {})
                        } as any,
                        __localizationRealmOverridesUserProfile: kcContext.__localizationRealmOverridesUserProfile
                    }),
                    currentLanguageTag,
                    getChangeLocalUrl: newLanguageTag => {
                        const { locale } = kcContext;

                        assert(locale !== undefined, "Internationalization not enabled");

                        const targetSupportedLocale = locale.supported.find(({ languageTag }) => languageTag === newLanguageTag);

                        assert(targetSupportedLocale !== undefined, `${newLanguageTag} need to be enabled in Keycloak admin`);

                        return targetSupportedLocale.url;
                    },
                    labelBySupportedLanguageTag: Object.fromEntries(
                        (kcContext.locale?.supported ?? []).map(({ languageTag, label }) => [languageTag, label])
                    )
                });
            })();
        }, []);

        return i18n ?? null;
    }

    return { useI18n };
}

function createI18nTranslationFunctions<MessageKey extends string>(params: {
    fallbackMessages: Record<MessageKey, string>;
    messages: Record<MessageKey, string>;
    __localizationRealmOverridesUserProfile: Record<string, string>;
}): Pick<GenericI18n<MessageKey>, "msg" | "msgStr" | "advancedMsg" | "advancedMsgStr"> {
    const { fallbackMessages, messages, __localizationRealmOverridesUserProfile } = params;

    function resolveMsg(props: { key: string; args: (string | undefined)[]; doRenderAsHtml: boolean }): string | JSX.Element | undefined {
        const { key, args, doRenderAsHtml } = props;

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

                messageWithArgsInjected = messageWithArgsInjected.replace(
                    new RegExp(`\\{${i + startIndex}\\}`, "g"),
                    arg.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                );
            });

            return messageWithArgsInjected;
        })();

        return doRenderAsHtml ? (
            <span
                // NOTE: The message is trusted. The arguments are not but are escaped.
                dangerouslySetInnerHTML={{
                    __html: messageWithArgsInjectedIfAny
                }}
            />
        ) : (
            messageWithArgsInjectedIfAny
        );
    }

    function resolveMsgAdvanced(props: { key: string; args: (string | undefined)[]; doRenderAsHtml: boolean }): JSX.Element | string {
        const { key, args, doRenderAsHtml } = props;

        if (key in __localizationRealmOverridesUserProfile) {
            const resolvedMessage = __localizationRealmOverridesUserProfile[key];

            return doRenderAsHtml ? (
                <span
                    // NOTE: The message is trusted. The arguments are not but are escaped.
                    dangerouslySetInnerHTML={{
                        __html: resolvedMessage
                    }}
                />
            ) : (
                resolvedMessage
            );
        }

        if (!/\$\{[^}]+\}/.test(key)) {
            const resolvedMessage = resolveMsg({ key, args, doRenderAsHtml });

            if (resolvedMessage === undefined) {
                return doRenderAsHtml ? <span dangerouslySetInnerHTML={{ __html: key }} /> : key;
            }

            return resolvedMessage;
        }

        let isFirstMatch = true;

        const resolvedComplexMessage = key.replace(/\$\{([^}]+)\}/g, (...[, key_i]) => {
            const replaceBy = resolveMsg({ key: key_i, args: isFirstMatch ? args : [], doRenderAsHtml: false }) ?? key_i;

            isFirstMatch = false;

            return replaceBy;
        });

        return doRenderAsHtml ? <span dangerouslySetInnerHTML={{ __html: resolvedComplexMessage }} /> : resolvedComplexMessage;
    }

    return {
        msgStr: (key, ...args) => resolveMsg({ key, args, doRenderAsHtml: false }) as string,
        msg: (key, ...args) => resolveMsg({ key, args, doRenderAsHtml: true }) as JSX.Element,
        advancedMsg: (key, ...args) =>
            resolveMsgAdvanced({
                key,
                args,
                doRenderAsHtml: true
            }) as JSX.Element,
        advancedMsgStr: (key, ...args) =>
            resolveMsgAdvanced({
                key,
                args,
                doRenderAsHtml: false
            }) as string
    };
}

const keycloakifyExtraMessages = {
    en: {
        shouldBeEqual: "{0} should be equal to {1}",
        shouldBeDifferent: "{0} should be different to {1}",
        shouldMatchPattern: "Pattern should match: `/{0}/`",
        mustBeAnInteger: "Must be an integer",
        notAValidOption: "Not a valid option",
        selectAnOption: "Select an option",
        remove: "Remove",
        addValue: "Add value"
    },
    fr: {
        /* spell-checker: disable */
        shouldBeEqual: "{0} doit être égal à {1}",
        shouldBeDifferent: "{0} doit être différent de {1}",
        shouldMatchPattern: "Dois respecter le schéma: `/{0}/`",
        mustBeAnInteger: "Doit être un nombre entier",
        notAValidOption: "N'est pas une option valide",

        logoutConfirmTitle: "Déconnexion",
        logoutConfirmHeader: "Êtes-vous sûr(e) de vouloir vous déconnecter ?",
        doLogout: "Se déconnecter",
        selectAnOption: "Sélectionner une option",
        remove: "Supprimer",
        addValue: "Ajouter une valeur"
        /* spell-checker: enable */
    }
};
