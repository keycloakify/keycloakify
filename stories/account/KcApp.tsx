import React from "react";
import Fallback from "../../dist/account";
import type { KcContext } from "./kcContext";
import { useI18n } from "./i18n";
import Template from "../../dist/account/Template";

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const i18n = useI18n({ kcContext });

    if (i18n === null) {
        return null;
    }

    return <Fallback {...{ kcContext, i18n }} Template={Template} doUseDefaultCss={true} />;
}
