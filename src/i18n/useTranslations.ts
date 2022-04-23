import type { Scheme, I18nSchemes, Translations } from "./translations";
import * as reactI18next from "react-i18next";
import { id } from "tsafe/id";
import { symToStr } from "tsafe/symToStr";

type NoParamsKeys<S extends Scheme> = NonNullable<
    {
        [K in keyof S]: S[K] extends undefined ? K : never;
    }[keyof S]
>;

export type TFunction<S extends Scheme> = {
    (key: NoParamsKeys<S>): string;
    <T extends Exclude<keyof S, NoParamsKeys<S>>>(key: T, params: S[T]): string;
};

const useReactI18nextTranslation = id<{
    <K extends keyof Translations>(ns: K): { t: TFunction<I18nSchemes[K]> };
}>(reactI18next.useTranslation);

export function useTranslation<K extends keyof Translations>(
    nsOrNsAsKey: Record<K, unknown>,
): { t: TFunction<I18nSchemes[K]> } {
    return useReactI18nextTranslation(symToStr(nsOrNsAsKey));
}
