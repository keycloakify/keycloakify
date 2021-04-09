
import { useCallback, useReducer } from "react";
import { useKcLanguageTag } from "./useKcLanguageTag";
import { kcMessages, evtTermsUpdated } from "./kcMessages/login";
import type { ReactNode } from "react";
import { useEvt } from "evt/hooks";
//NOTE for later: https://github.com/remarkjs/react-markdown/blob/236182ecf30bd89c1e5a7652acaf8d0bf81e6170/src/renderers.js#L7-L35
import ReactMarkdown from "react-markdown";

export type MessageKey = keyof typeof kcMessages["en"];

export function useKcMessage() {

    const { kcLanguageTag } = useKcLanguageTag();

    const [trigger, forceUpdate] = useReducer((counter: number) => counter + 1, 0);

    useEvt(ctx => evtTermsUpdated.attach(ctx, forceUpdate), []);

    const msgStr = useCallback(
        (key: MessageKey, ...args: (string | undefined)[]): string => {

            let str: string = kcMessages[kcLanguageTag as any as "en"][key] ?? kcMessages["en"][key];

            args.forEach((arg, i) => {

                if (arg === undefined) {
                    return;
                }

                str = str.replace(new RegExp(`\\{${i}\\}`, "g"), arg);

            });

            return str;

        },
        [kcLanguageTag, trigger]
    );

    const msg = useCallback<(...args: Parameters<typeof msgStr>) => ReactNode>(
        (key, ...args) =>
            <ReactMarkdown allowDangerousHtml renderers={key === "termsText" ? undefined : { "paragraph": "span" }}>
                {msgStr(key, ...args)}
            </ReactMarkdown>,
        [msgStr]
    );

    return { msg, msgStr };

}