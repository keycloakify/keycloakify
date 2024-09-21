import { i18nInitializer } from "../../dist/account";
import type { ThemeName } from "../kc.gen";

export const { useI18n, ofTypeI18n } = i18nInitializer
    .withThemeName<ThemeName>()
    .withCustomTranslations({})
    .create();

export type I18n = typeof ofTypeI18n;
