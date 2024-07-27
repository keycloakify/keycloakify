import type { GenericI18n } from "./GenericI18n";
import type { MessageKey_defaultSet, KcContextLike } from "./i18n";
export type { MessageKey_defaultSet, KcContextLike };
export type I18n = GenericI18n<MessageKey_defaultSet>;
export { createUseI18n } from "./useI18n";
