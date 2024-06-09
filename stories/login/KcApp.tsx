import React from "react";
import DefaultPage from "../../dist/login/Fallback";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import { useDownloadTerms } from "../../dist/login/lib/useDownloadTerms";
import Template from "../../dist/login/Template";
import UserProfileFormFields from "../../dist/login/UserProfileFormFields";

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    useDownloadTerms({
        kcContext,
        downloadTermsMarkdown: async ({ currentLanguageTag }) => {
            let termsLanguageTag = currentLanguageTag;
            let termsFileName: string;

            switch (currentLanguageTag) {
                case "fr":
                    termsFileName = "fr.md";
                    break;
                case "es":
                    termsFileName = "es.md";
                    break;
                default:
                    termsFileName = "en.md";
                    termsLanguageTag = "en";
                    break;
            }

            const termsMarkdown = await fetch(`/terms/${termsFileName}`).then(response => response.text());

            return { termsMarkdown, termsLanguageTag };
        }
    });

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
