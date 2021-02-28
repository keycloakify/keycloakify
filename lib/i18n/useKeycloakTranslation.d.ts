import { messages } from "./messages.generated";
export declare type MessageKey = keyof typeof messages["login"]["en"];
export declare function useKeycloakThemeTranslation(): {
    t: (key: MessageKey) => string;
};
