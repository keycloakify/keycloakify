import { i18nBuilder } from "../../dist/account";
import type { ThemeName } from "../kc.gen";

export const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({})
    .create();

export type I18n = typeof ofTypeI18n;
