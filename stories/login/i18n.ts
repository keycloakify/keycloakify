import { i18nBuilder } from "../../dist/login";

const { useI18n, ofTypeI18n } = i18nBuilder.build();

type I18n = typeof ofTypeI18n;

export { useI18n, I18n };
