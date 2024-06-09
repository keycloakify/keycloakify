import type { GenericI18n, MessageKey, KcContextLike } from "./i18n";
export type { MessageKey, KcContextLike };
export type I18n = GenericI18n<MessageKey>;
export { createUseI18n } from "./i18n";
export { fallbackLanguageTag } from "./i18n";
