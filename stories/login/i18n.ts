import { createUseI18n } from "../../dist/login";

export const { useI18n } = createUseI18n({});

export type I18n = NonNullable<ReturnType<typeof useI18n>>;
