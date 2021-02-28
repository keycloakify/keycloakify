import { messages } from "./generated_messages/login";
export declare type MessageKey = keyof typeof messages["en"];
export declare function useKeycloakThemeTranslation(): {
    t: (key: MessageKey) => string;
};
