import React from "react";
import DefaultPage from "../../dist/login/DefaultPage";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import Template from "../../dist/login/Template";
import UserProfileFormFields from "../../dist/login/UserProfileFormFields";

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <DefaultPage
            kcContext={kcContext}
            i18n={i18n}
            Template={Template}
            doUseDefaultCss={true}
            UserProfileFormFields={UserProfileFormFields}
            doMakeUserConfirmPassword={true}
        />
    );
}
