import { i18nBuilder } from "../../dist/account";

const { useI18n, ofTypeI18n } = i18nBuilder.build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
