import React from "react";
import Fallback from "../../dist/account/Fallback";
import type { KcContext } from "./KcContext";
import Template from "../../dist/account/Template";

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    return <Fallback kcContext={kcContext} Template={Template} doUseDefaultCss={true} />;
}
