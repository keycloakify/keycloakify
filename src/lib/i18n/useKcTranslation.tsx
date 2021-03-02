
import { useKcLanguageTag } from "./useKcLanguageTag";
import { messages } from "./generated_messages/login";
import { useConstCallback } from "powerhooks";
import type { ReactNode } from "react";
import { id } from "evt/tools/typeSafety/id";

export type MessageKey = keyof typeof messages["en"];

export function useKcTranslation() {

    const { kcLanguageTag } = useKcLanguageTag();

    const tStr = useConstCallback(
        (key: MessageKey, ...args: (string | undefined)[]): string => {

            let str: string = messages[kcLanguageTag as any as "en"][key] ?? messages["en"][key];

            args.forEach((arg, i) => {

                if (arg === undefined) {
                    return;
                }

                str = str.replace(new RegExp(`\\{${i}\\}`, "g"), arg);

            });

            return str;

        }
    );

    const t = useConstCallback(
        id<(...args: Parameters<typeof tStr>) => ReactNode>(
            (key, ...args) =>
                <span className={key} dangerouslySetInnerHTML={{ "__html": tStr(key, ...args) }} />
        )
    );

    return { t, tStr };

}