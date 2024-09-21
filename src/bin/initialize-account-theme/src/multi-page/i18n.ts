import { i18nBuilder } from "keycloakify/account";
import type { ThemeName } from "../kc.gen";

const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withExtraLanguages({})
    .withCustomTranslations({})
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
