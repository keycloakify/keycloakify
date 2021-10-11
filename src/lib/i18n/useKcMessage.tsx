import { useCallback, useReducer } from "react";
import { useKcLanguageTag } from "./useKcLanguageTag";
import { kcMessages, evtTermsUpdated } from "./kcMessages/login";
import { useEvt } from "evt/hooks";
//NOTE for later: https://github.com/remarkjs/react-markdown/blob/236182ecf30bd89c1e5a7652acaf8d0bf81e6170/src/renderers.js#L7-L35
import ReactMarkdown from "react-markdown";
import { id } from "tsafe/id";

export { kcMessages };

export type MessageKey = keyof typeof kcMessages["en"];

/**
 * When the language is switched the page is reloaded, this may appear
 * as a bug as you might notice that the language successfully switch before
 * reload.
 * However we need to tell Keycloak that the user have changed the language
 * during login so we can retrieve the "local" field of the JWT encoded accessToken.
 */
export function useKcMessage() {
    const { kcLanguageTag } = useKcLanguageTag();

    const [trigger, forceUpdate] = useReducer(
        (counter: number) => counter + 1,
        0,
    );

    useEvt(ctx => evtTermsUpdated.attach(ctx, forceUpdate), []);

    const msgStr = useCallback(
        (key: MessageKey, ...args: (string | undefined)[]): string => {
            let str: string =
                kcMessages[kcLanguageTag as any as "en"][key] ??
                kcMessages["en"][key];

            args.forEach((arg, i) => {
                if (arg === undefined) {
                    return;
                }

                str = str.replace(new RegExp(`\\{${i}\\}`, "g"), arg);
            });

            return str;
        },
        [kcLanguageTag, trigger],
    );

    const msg = useCallback<
        (...args: Parameters<typeof msgStr>) => JSX.Element
    >(
        (key, ...args) => (
            <ReactMarkdown
                allowDangerousHtml
                renderers={
                    key === "termsText" ? undefined : { "paragraph": "span" }
                }
            >
                {msgStr(key, ...args)}
            </ReactMarkdown>
        ),
        [msgStr],
    );

    const advancedMsg = useCallback(
        (key: string): string | undefined => {
            const match = key.match(/^\$\{([^{]+)\}$/);

            const resolvedKey = match === null ? key : match[1];

            const out =
                id<Record<string, string | undefined>>(
                    kcMessages[kcLanguageTag],
                )[resolvedKey] ??
                id<Record<string, string | undefined>>(kcMessages["en"])[
                    resolvedKey
                ];

            return out !== undefined ? out : match === null ? key : undefined;
        },
        [msgStr],
    );

    return { msg, msgStr, advancedMsg };
}
