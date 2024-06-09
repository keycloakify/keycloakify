export type { MessageKey, KcContextLike } from "./i18n";
import { createUseI18n } from "./i18n";
export { createUseI18n };
export { fallbackLanguageTag } from "./i18n";

const { useI18n, ofTypeI18n } = createUseI18n({});

export type I18n = typeof ofTypeI18n;

export { useI18n };
