
import { useKeycloakLanguage } from "./useKeycloakLanguage";
import { messages } from "./generated_messages/login";
import { useConstCallback } from "powerhooks";
import type { ReactNode } from "react";

export type MessageKey = keyof typeof messages["en"]


export function useKeycloakThemeTranslation() {

    const { keycloakLanguage } = useKeycloakLanguage();

    const t = useConstCallback(
        (key: MessageKey, ...args: (string | undefined)[]): ReactNode => {

            let out: string = messages[keycloakLanguage as any as "en"][key] ?? messages["en"][key];

            args.forEach((arg, i) => {

                if (arg === undefined) {
                    return;
                }

                out = out.replace(new RegExp(`\\{${i}\\}`, "g"), arg);

            });

            return <span className={key} dangerouslySetInnerHTML={{ "__html": out }} />;

        }
    );

    return { t };

}