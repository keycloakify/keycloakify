/// <reference types="react" />
import "minimal-polyfills/Object.fromEntries";
import { kcMessages } from "./kcMessages/login";
export { kcMessages };
export declare type MessageKey = keyof typeof kcMessages["en"];
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
export declare function useKcMessage(): {
    msgStr: (key: MessageKey, ...args: (string | undefined)[]) => string;
    msg: (key: MessageKey, ...args: (string | undefined)[]) => JSX.Element;
    advancedMsg: <Key extends string>(key: Key, ...args: (string | undefined)[]) => JSX.Element;
    advancedMsgStr: <Key_1 extends string>(key: Key_1, ...args: (string | undefined)[]) => string;
};
