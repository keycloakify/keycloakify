
import { useKeycloakLanguage } from "./useKeycloakLanguage";
import { messages } from "./generated_messages/login";
import { useConstCallback } from "powerhooks";

export type MessageKey = keyof typeof messages["en"]

export function useKeycloakThemeTranslation() {

    const { keycloakLanguage } = useKeycloakLanguage();

    const t = useConstCallback(
        (key: MessageKey): string => {

            const out: string | undefined = messages[keycloakLanguage as any as "en"][key];

            if (out !== undefined) {
                return out;
            }

            return messages["en"][key];

        }
    );

    return { t };

}