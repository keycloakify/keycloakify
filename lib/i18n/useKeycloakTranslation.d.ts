import { messages } from "./generated_messages/login";
import type { ReactNode } from "react";
export declare type MessageKey = keyof typeof messages["en"];
export declare function useKeycloakThemeTranslation(): {
    t: (key: MessageKey, ...args: (string | undefined)[]) => ReactNode;
};
