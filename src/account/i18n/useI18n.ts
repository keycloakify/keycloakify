import { useEffect, useState } from "react";
import {
    createGetI18n,
    type GenericI18n,
    type MessageKey,
    type KcContextLike
} from "./i18n";
import { Reflect } from "tsafe/Reflect";

export function createUseI18n<ExtraMessageKey extends string = never>(messageBundle: {
    [languageTag: string]: { [key in ExtraMessageKey]: string };
}) {
    type I18n = GenericI18n<MessageKey | ExtraMessageKey>;

    const { getI18n } = createGetI18n(messageBundle);

    function useI18n(params: { kcContext: KcContextLike }): { i18n: I18n } {
        const { kcContext } = params;

        const { i18n, prI18n_currentLanguage } = getI18n({ kcContext });

        const [i18n_toReturn, setI18n_toReturn] = useState<I18n>(i18n);

        useEffect(() => {
            let isActive = true;

            prI18n_currentLanguage?.then(i18n => {
                if (!isActive) {
                    return;
                }

                setI18n_toReturn(i18n);
            });

            return () => {
                isActive = false;
            };
        }, []);

        return { i18n: i18n_toReturn };
    }

    return { useI18n, ofTypeI18n: Reflect<I18n>() };
}
