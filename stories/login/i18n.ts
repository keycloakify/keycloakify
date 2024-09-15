import { i18nApi } from "../../dist/login";
import type { ThemeName } from "../kc.gen";

export const { useI18n, ofTypeI18n } = i18nApi
    .withThemeName<ThemeName>()
    .withTranslations({})
    .create();

export type I18n = typeof ofTypeI18n;
