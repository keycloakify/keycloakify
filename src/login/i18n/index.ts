export * from "./withJsx";
import type { GenericI18n } from "./withJsx/GenericI18n";
import type { MessageKey as MessageKey_defaultSet } from "./messages_defaultSet/types";
/** INTERNAL: DO NOT IMPORT THIS */
export type I18n = GenericI18n<MessageKey_defaultSet, string>;
