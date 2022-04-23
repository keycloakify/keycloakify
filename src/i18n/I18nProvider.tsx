import { useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./translations";
import { I18nextProvider } from "react-i18next";
import { Evt } from "evt";
import { useEvt } from "evt/hooks";
import { useEffectOnValueChange } from "powerhooks/useEffectOnValueChange";
import { useLng } from "./useLng";
import {} from "powerhooks/useConst";

export type Props = {
    children: React.ReactNode;
};

export function I18nProvider(props: Props) {
    const { children } = props;

    const { lng } = useLng();

    const [{ i18nInstance }] = useState(() => {
        i18n.use(initReactI18next).init({
            "debug": false,
            "interpolation": {
                "escapeValue": false,
            },
            resources,
        });

        return { "i18nInstance": i18n.cloneInstance({ lng }) };
    });

    useEffectOnValueChange(() => {
        i18nInstance.changeLanguage(lng);
    }, [lng]);

    useEvt(
        (ctx, registerSideEffect) =>
            Evt.from(ctx, i18nInstance as any, "languagechange").attach(() =>
                registerSideEffect(() => {
                    /* We just trigger a re-render */
                }),
            ),
        [i18nInstance],
    );

    return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
