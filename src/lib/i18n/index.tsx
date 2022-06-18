import "minimal-polyfills/Object.fromEntries";
//NOTE for later: https://github.com/remarkjs/react-markdown/blob/236182ecf30bd89c1e5a7652acaf8d0bf81e6170/src/renderers.js#L7-L35
import ReactMarkdown from "react-markdown";
import memoize from "memoizee";
import { kcMessages as kcMessagesBase } from "./generated_kcMessages/18.0.1/login";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";

export const kcMessages = {
    ...kcMessagesBase,
    "en": {
        ...kcMessagesBase["en"],
        "termsText": "⏳",
        "shouldBeEqual": "{0} should be equal to {1}",
        "shouldBeDifferent": "{0} should be different to {1}",
        "shouldMatchPattern": "Pattern should match: `/{0}/`",
        "mustBeAnInteger": "Must be an integer",
        "notAValidOption": "Not a valid option",
    },
    "fr": {
        ...kcMessagesBase["fr"],
        /* spell-checker: disable */
        "shouldBeEqual": "{0} doit être egale à {1}",
        "shouldBeDifferent": "{0} doit être différent de {1}",
        "shouldMatchPattern": "Dois respecter le schéma: `/{0}/`",
        "mustBeAnInteger": "Doit être un nombre entiers",
        "notAValidOption": "N'est pas une option valide",
        /* spell-checker: enable */
    },
};

export type KcLanguageTag = keyof typeof kcMessages;

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
    "fi",
    "lv",
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

export type MessageKey = keyof typeof kcMessages["en"];

function resolveMsg<Key extends string, DoRenderMarkdown extends boolean>(props: {
    key: Key;
    args: (string | undefined)[];
    kcLanguageTag: string;
    doRenderMarkdown: DoRenderMarkdown;
}): Key extends MessageKey ? (DoRenderMarkdown extends true ? JSX.Element : string) : undefined {
    const { key, args, kcLanguageTag, doRenderMarkdown } = props;

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
}): DoRenderMarkdown extends true ? JSX.Element : string {
    const { key, args, kcLanguageTag, doRenderMarkdown } = props;

    const match = key.match(/^\$\{([^{]+)\}$/);

    const keyUnwrappedFromCurlyBraces = match === null ? key : match[1];

    const out = resolveMsg({
        "key": keyUnwrappedFromCurlyBraces,
        args,
        kcLanguageTag,
        doRenderMarkdown,
    });

    return (out !== undefined ? out : doRenderMarkdown ? <span>{keyUnwrappedFromCurlyBraces}</span> : keyUnwrappedFromCurlyBraces) as any;
}

/**
 * When the language is switched the page is reloaded, this may appear
 * as a bug as you might notice that the language successfully switch before
 * reload.
 * However we need to tell Keycloak that the user have changed the language
 * during login so we can retrieve the "local" field of the JWT encoded accessToken.
 * https://user-images.githubusercontent.com/6702424/138096682-351bb61f-f24e-4caf-91b7-cca8cfa2cb58.mov
 *
 * advancedMsg("${access-denied}") === advancedMsg("access-denied") === msg("access-denied")
 * advancedMsg("${not-a-message-key}") === advancedMsg(not-a-message-key") === "not-a-message-key"
 *
 *
 * NOTE: This function is memoized, it always returns the same object for a given kcContext)
 *
 */
export const getMsg = memoize((kcContext: KcContextLike) => {
    const kcLanguageTag = getCurrentKcLanguageTag(kcContext);

    return {
        "msgStr": (key: MessageKey, ...args: (string | undefined)[]): string => resolveMsg({ key, args, kcLanguageTag, "doRenderMarkdown": false }),
        "msg": (key: MessageKey, ...args: (string | undefined)[]): JSX.Element => resolveMsg({ key, args, kcLanguageTag, "doRenderMarkdown": true }),
        "advancedMsg": <Key extends string>(key: Key, ...args: (string | undefined)[]): JSX.Element =>
            resolveMsgAdvanced({ key, args, kcLanguageTag, "doRenderMarkdown": true }),
        "advancedMsgStr": <Key extends string>(key: Key, ...args: (string | undefined)[]): string =>
            resolveMsgAdvanced({ key, args, kcLanguageTag, "doRenderMarkdown": false }),
    };
});
