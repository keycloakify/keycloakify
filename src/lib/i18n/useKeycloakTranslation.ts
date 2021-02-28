
import { useKeycloakLanguage } from "./useKeycloakLanguage";
import { messages } from "./messages.generated";
import { useConstCallback } from "powerhooks";

export type MessageKey = keyof typeof messages["login"]["en"]

export function useKeycloakThemeTranslation() {

    const { keycloakLanguage } = useKeycloakLanguage();

    const t = useConstCallback(
        (key: MessageKey): string => {

            const out: string | undefined = messages["login"][keycloakLanguage as any as "en"][key];

            if (out !== undefined) {
                return out;
            }

            return messages["login"]["en"][key];

        }
    );

    return { t };

}