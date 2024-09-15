import type { GenericI18n_noJsx } from "./i18n";

export type GenericI18n<MessageKey extends string, LanguageTag extends string> = GenericI18n_noJsx<MessageKey, LanguageTag> & {
    msg: (key: MessageKey, ...args: (string | undefined)[]) => JSX.Element;
    advancedMsg: (key: string, ...args: (string | undefined)[]) => JSX.Element;
};
