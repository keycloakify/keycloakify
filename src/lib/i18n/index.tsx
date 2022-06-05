import "minimal-polyfills/Object.fromEntries";
//NOTE for later: https://github.com/remarkjs/react-markdown/blob/236182ecf30bd89c1e5a7652acaf8d0bf81e6170/src/renderers.js#L7-L35
import ReactMarkdown from "react-markdown";
import type { kcMessages as t_kcMessages } from "./kcMessages";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { createObjectThatThrowsIfAccessed } from "../tools/createObjectThatThrowsIfAccessed";
import { Evt } from "evt";
import { useRerenderOnStateChange } from "evt/hooks";
import { useMemo } from "react";
import type { StatefulReadonlyEvt } from "evt";

export type KcMessages = typeof t_kcMessages;

export type KcLanguageTag = keyof KcMessages;

export const kcLanguageTags = [
    "en",
    "fr",
    "ca",
    "cs",
    "da",
    "de",
    "es",
    "hu",
    "it",
    "ja",
    "lt",
    "nl",
    "no",
    "pl",
    "pt-BR",
    "ru",
    "sk",
    "sv",
    "tr",
    "zh-CN",
] as const;

assert<Equals<KcLanguageTag, typeof kcLanguageTags[number]>>();

type KcContextLike = { locale?: { currentLanguageTag: KcLanguageTag } };

export function getCurrentKcLanguageTag(kcContext: KcContextLike) {
    return kcContext.locale?.currentLanguageTag ?? "en";
}

export function getTagLabel(params: {
    kcContext: {
        locale?: {
            supported: { languageTag: KcLanguageTag; label: string }[];
        };
    };
    kcLanguageTag: KcLanguageTag;
}): string {
    const { kcContext, kcLanguageTag } = params;

    const { locale } = kcContext;

    assert(locale !== undefined, "Internationalization not enabled");

    const targetSupportedLocale = locale.supported.find(({ languageTag }) => languageTag === kcLanguageTag);

    assert(targetSupportedLocale !== undefined, `${kcLanguageTag} need to be enabled in Keycloak admin`);

    return targetSupportedLocale.label;
}

export function changeLocale(params: {
    kcContext: {
        locale?: {
            supported: { languageTag: KcLanguageTag; url: string }[];
        };
    };
    kcLanguageTag: KcLanguageTag;
}): never {
    const { kcContext, kcLanguageTag } = params;

    const { locale } = kcContext;

    assert(locale !== undefined, "Internationalization not enabled");

    const targetSupportedLocale = locale.supported.find(({ languageTag }) => languageTag === kcLanguageTag);

    assert(targetSupportedLocale !== undefined, `${kcLanguageTag} need to be enabled in Keycloak admin`);

    window.location.href = targetSupportedLocale.url;

    assert(false, "never");
}

export type MessageKey = keyof KcMessages["en"];

function resolveMsg<Key extends string, DoRenderMarkdown extends boolean>(props: {
    key: Key;
    args: (string | undefined)[];
    kcLanguageTag: string;
    doRenderMarkdown: DoRenderMarkdown;
    kcMessages: KcMessages;
}): Key extends MessageKey ? (DoRenderMarkdown extends true ? JSX.Element : string) : undefined {
    const { key, args, kcLanguageTag, doRenderMarkdown, kcMessages } = props;

    let str = kcMessages[kcLanguageTag as any as "en"][key as MessageKey] ?? kcMessages["en"][key as MessageKey];

    if (str === undefined) {
        return undefined as any;
    }

    str = (() => {
        const startIndex = str
            .match(/{[0-9]+}/g)
            ?.map(g => g.match(/{([0-9]+)}/)![1])
            .map(indexStr => parseInt(indexStr))
            .sort((a, b) => a - b)[0];

        if (startIndex === undefined) {
            return str;
        }

        args.forEach((arg, i) => {
            if (arg === undefined) {
                return;
            }

            str = str.replace(new RegExp(`\\{${i + startIndex}\\}`, "g"), arg);
        });

        return str;
    })();

    return (
        doRenderMarkdown ? (
            <ReactMarkdown allowDangerousHtml renderers={key === "termsText" ? undefined : { "paragraph": "span" }}>
                {str}
            </ReactMarkdown>
        ) : (
            str
        )
    ) as any;
}

function resolveMsgAdvanced<Key extends string, DoRenderMarkdown extends boolean>(props: {
    key: Key;
    args: (string | undefined)[];
    kcLanguageTag: string;
    doRenderMarkdown: DoRenderMarkdown;
    kcMessages: KcMessages;
}): DoRenderMarkdown extends true ? JSX.Element : string {
    const { key, args, kcLanguageTag, doRenderMarkdown, kcMessages } = props;

    const match = key.match(/^\$\{([^{]+)\}$/);

    const keyUnwrappedFromCurlyBraces = match === null ? key : match[1];

    const out = resolveMsg({
        "key": keyUnwrappedFromCurlyBraces,
        args,
        kcLanguageTag,
        doRenderMarkdown,
        kcMessages,
    });

    return (out !== undefined ? out : doRenderMarkdown ? <span>{keyUnwrappedFromCurlyBraces}</span> : keyUnwrappedFromCurlyBraces) as any;
}

export type I18n = {
    msg: (key: MessageKey, ...args: (string | undefined)[]) => JSX.Element;
    msgStr: (key: MessageKey, ...args: (string | undefined)[]) => string;
    advancedMsgStr: (key: string, ...args: (string | undefined)[]) => string;
    advancedMsg: (key: string, ...args: (string | undefined)[]) => JSX.Element;
    evtKcMessages: StatefulReadonlyEvt<KcMessages | undefined>;
};

export { StatefulReadonlyEvt };

/**
 * advancedMsg("${access-denied}") === advancedMsg("access-denied") === msg("access-denied")
 * advancedMsg("${not-a-message-key}") === advancedMsg(not-a-message-key") === "not-a-message-key"
 */
export function createUseI18n(props: { kcMessages: KcMessages | (() => Promise<KcMessages>); kcContext: KcContextLike | undefined }) {
    const { kcContext, kcMessages: kcMessagesOrFetchKcMessages } = props;

    if (kcContext === undefined) {
        return createObjectThatThrowsIfAccessed<{ useI18n: () => I18n }>({ "debugMessage": "Can't use Keycloakify i18n outside of keycloak" });
    }

    const { evtKcMessages } = (() => {
        const evtKcMessages = Evt.create<KcMessages | undefined>(undefined);

        if (typeof kcMessagesOrFetchKcMessages === "function") {
            kcMessagesOrFetchKcMessages().then(kcMessages => (evtKcMessages.state = kcMessages));
        } else {
            evtKcMessages.state = kcMessagesOrFetchKcMessages;
        }

        return { evtKcMessages };
    })();
    Evt.factorize(
        typeof kcMessagesOrFetchKcMessages === "function"
            ? Evt.from(kcMessagesOrFetchKcMessages()).toStateful()
            : Evt.create(kcMessagesOrFetchKcMessages),
    );

    const kcLanguageTag = getCurrentKcLanguageTag(kcContext);

    function useI18n() {
        useRerenderOnStateChange(evtKcMessages);

        const i18n = useMemo((): I18n => {
            const kcMessages = evtKcMessages.state;

            if (kcMessages === undefined) {
                return {
                    "msgStr": () => "",
                    "msg": () => <></>,
                    "advancedMsg": () => <></>,
                    "advancedMsgStr": () => "",
                    evtKcMessages,
                };
            }

            return {
                "msgStr": (key, ...args) => resolveMsg({ key, args, kcLanguageTag, "doRenderMarkdown": false, kcMessages }),
                "msg": (key, ...args): JSX.Element => resolveMsg({ key, args, kcLanguageTag, "doRenderMarkdown": true, kcMessages }),
                "advancedMsg": (key, ...args) => resolveMsgAdvanced({ key, args, kcLanguageTag, "doRenderMarkdown": true, kcMessages }),
                "advancedMsgStr": (key, ...args) => resolveMsgAdvanced({ key, args, kcLanguageTag, "doRenderMarkdown": false, kcMessages }),
                evtKcMessages,
            };
        }, [evtKcMessages.state]);

        return i18n;
    }

    return { useI18n };
}
