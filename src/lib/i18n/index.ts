import { createI18nApi } from "./createI18nApi";
import type { I18n } from "./createI18nApi";

export const { I18nProvider, useI18n } = createI18nApi({
    "extraMessages": {},
});

export type MessageKey = ReturnType<typeof useI18n> extends I18n<infer U> ? U : never;
