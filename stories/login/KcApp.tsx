import React from "react";
import Fallback from "../../dist/login";
import type { KcContext } from "./kcContext";
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
            const resource = (() => {
                switch (currentLanguageTag) {
                    case "fr":
                        return "/tos/tos_fr.md";
                    case "es":
                        return "/tos/tos_es.md";
                    default:
                        return "/tos/tos_en.md";
                }
            })();

            const response = await fetch(resource);
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
