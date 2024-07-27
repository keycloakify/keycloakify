import React from "react";
import DefaultPage from "../../dist/account/DefaultPage";
import { useI18n } from "./i18n";
import type { KcContext } from "./KcContext";
import Template from "../../dist/account/Template";

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return <DefaultPage kcContext={kcContext} i18n={i18n} Template={Template} doUseDefaultCss={true} />;
}
