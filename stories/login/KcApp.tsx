import React from "react";
import Fallback from "../../dist/login/Fallback";
import type { KcContext } from "./KcContext";
import { useDownloadTerms } from "../../dist/login/lib/useDownloadTerms";
import Template from "../../dist/login/Template";
import UserProfileFormFields from "../../dist/login/UserProfileFormFields";

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

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
        <Fallback
            kcContext={kcContext}
            Template={Template}
            doUseDefaultCss={true}
            UserProfileFormFields={UserProfileFormFields}
            doMakeUserConfirmPassword={true}
        />
    );
}
