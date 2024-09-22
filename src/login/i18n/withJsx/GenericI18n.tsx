import type { GenericI18n_noJsx } from "../noJsx/GenericI18n_noJsx";
import { assert, type Equals } from "tsafe/assert";

export type GenericI18n<MessageKey extends string, LanguageTag extends string> = {
    currentLanguage: {
        /**
         * e.g: "en", "fr", "zh-CN"
         *
         * The current language
         */
        languageTag: LanguageTag;
        /**
         * e.g: "English", "Français", "中文（简体）"
         *
         * The current language
         */
        label: string;
    };
    /**
     * Array of languages enabled on the realm.
     */
    enabledLanguages: {
        languageTag: LanguageTag;
        label: string;
        href: string;
    }[];
    /**
     *
     * Examples assuming currentLanguageTag === "en"
     * {
     *   en: {
     *     "access-denied": "Access denied",
     *     "impersonateTitleHtml": "<strong>{0}</strong> Impersonate User",
     *     "bar": "Bar {0}"
     *   }
     * }
     *
     * msgStr("access-denied") === "Access denied"
     * msgStr("not-a-message-key") Throws an error
     * msgStr("impersonateTitleHtml", "Foo") === "<strong>Foo</strong> Impersonate User"
     * msgStr("${bar}", "<strong>c</strong>") === "Bar &lt;strong&gt;XXX&lt;/strong&gt;"
     *  The html in the arg is partially escaped for security reasons, it might come from an untrusted source, it's not safe to render it as html.
     */
    msgStr: (key: MessageKey, ...args: (string | undefined)[]) => string;
    /**
     * This is meant to be used when the key argument is variable, something that might have been configured by the user
     * in the Keycloak admin for example.
     *
     * Examples assuming currentLanguageTag === "en"
     * {
     *   en: {
     *     "access-denied": "Access denied",
     *   }
     * }
     *
     * advancedMsgStr("${access-denied}") === advancedMsgStr("access-denied") === msgStr("access-denied") === "Access denied"
     * advancedMsgStr("${not-a-message-key}") === advancedMsgStr("not-a-message-key") === "not-a-message-key"
     */
    advancedMsgStr: (key: string, ...args: (string | undefined)[]) => string;
    /**
     * Initially the messages are in english (fallback language).
     * The translations in the current language are being fetched dynamically.
     * This property is true while the translations are being fetched.
     */
    isFetchingTranslations: boolean;
    /**
     * Same as msgStr but returns a JSX.Element with the html string rendered as html.
     */
    msg: (key: MessageKey, ...args: (string | undefined)[]) => JSX.Element;
    /**
     * Same as advancedMsgStr but returns a JSX.Element with the html string rendered as html.
     */
    advancedMsg: (key: string, ...args: (string | undefined)[]) => JSX.Element;
};

{
    type A = Omit<GenericI18n<string, string>, "msg" | "advancedMsg">;
    type B = GenericI18n_noJsx<string, string>;

    assert<Equals<A, B>>;
}
