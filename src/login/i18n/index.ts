export * from "./withJsx";
import type { GenericI18n } from "./withJsx/GenericI18n";
import type {
    LanguageTag as LanguageTag_defaultSet,
    MessageKey as MessageKey_defaultSet
} from "./messages_defaultSet/types";
/** INTERNAL: DO NOT IMPORT THIS */
export type I18n = GenericI18n<MessageKey_defaultSet, LanguageTag_defaultSet>;
