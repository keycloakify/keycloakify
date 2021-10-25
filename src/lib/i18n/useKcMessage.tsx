import "minimal-polyfills/Object.fromEntries";
import { useReducer } from "react";
import { useKcLanguageTag } from "./useKcLanguageTag";
import { kcMessages, evtTermsUpdated } from "./kcMessages/login";
import { useEvt } from "evt/hooks";
//NOTE for later: https://github.com/remarkjs/react-markdown/blob/236182ecf30bd89c1e5a7652acaf8d0bf81e6170/src/renderers.js#L7-L35
import ReactMarkdown from "react-markdown";
import { useGuaranteedMemo } from "powerhooks/useGuaranteedMemo";

export { kcMessages };

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
            .match(/(?<={)[0-9]+(?=})/g)
            ?.map(g => parseInt(g))
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

    const resolvedKey = match === null ? key : match[1];

    const out = resolveMsg({
        "key": resolvedKey,
        args,
        kcLanguageTag,
        doRenderMarkdown,
    });

    return (out !== undefined ? out : match === null ? doRenderMarkdown ? <span>{key}</span> : key : undefined) as any;
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
 */
export function useKcMessage() {
    const { kcLanguageTag } = useKcLanguageTag();

    const [trigger, forceUpdate] = useReducer((counter: number) => counter + 1, 0);

    useEvt(ctx => evtTermsUpdated.attach(ctx, forceUpdate), []);

    return useGuaranteedMemo(
        () => ({
            "msgStr": (key: MessageKey, ...args: (string | undefined)[]): string =>
                resolveMsg({ key, args, kcLanguageTag, "doRenderMarkdown": false }),
            "msg": (key: MessageKey, ...args: (string | undefined)[]): JSX.Element =>
                resolveMsg({ key, args, kcLanguageTag, "doRenderMarkdown": true }),
            "advancedMsg": <Key extends string>(key: Key, ...args: (string | undefined)[]): JSX.Element =>
                resolveMsgAdvanced({ key, args, kcLanguageTag, "doRenderMarkdown": true }),
            "advancedMsgStr": <Key extends string>(key: Key, ...args: (string | undefined)[]): string =>
                resolveMsgAdvanced({ key, args, kcLanguageTag, "doRenderMarkdown": false }),
        }),
        [kcLanguageTag, trigger],
    );
}
