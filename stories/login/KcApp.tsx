import React from "react";
import Fallback from "../../dist/login/Fallback";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import { useDownloadTerms } from "../../dist/login/lib/useDownloadTerms";
import Template from "../../dist/login/Template";
import UserProfileFormFields from "../../dist/login/UserProfileFormFields";

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const i18n = useI18n({ kcContext });

    useDownloadTerms({
        kcContext,
        downloadTermMarkdown: async ({ currentLanguageTag }) => {
            const termsFileName = (() => {
                switch (currentLanguageTag) {
                    case "fr":
                        return "fr.md";
                    case "es":
                        return "es.md";
                    default:
                        return "en.md";
                }
            })();

            const response = await fetch(`/terms/${termsFileName}`);

            return response.text();
        }
    });

    if (i18n === null) {
        return null;
    }

    return (
        <Fallback
            {...{
                kcContext,
                i18n,
                Template,
                UserProfileFormFields
            }}
            doUseDefaultCss={true}
        />
    );
}
