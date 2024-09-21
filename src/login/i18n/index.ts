import type { GenericI18n } from "./GenericI18n";
import type { LanguageTag } from "./messages_defaultSet/LanguageTag";
import type { MessageKey_defaultSet, KcContextLike } from "./i18n";
export type { MessageKey_defaultSet, KcContextLike };
export type I18n = GenericI18n<MessageKey_defaultSet, LanguageTag>;
export { createUseI18n, i18nApi } from "./useI18n";
