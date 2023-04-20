import { createUseI18n } from "../../dist/account";

export const { useI18n } = createUseI18n({});

export type I18n = NonNullable<ReturnType<typeof useI18n>>;
