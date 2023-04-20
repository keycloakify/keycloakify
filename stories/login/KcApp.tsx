import React, { lazy, Suspense } from "react";
import Fallback from "../../dist/login";
import type { KcContext } from "./kcContext";
import { useI18n } from "./i18n";
import { useDownloadTerms } from "../../dist/login/lib/useDownloadTerms";
import tos_en_url from "./tos_en.md";
import tos_fr_url from "./tos_fr.md";

const DefaultTemplate = lazy(() => import("../../dist/login/Template"));

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const i18n = useI18n({ kcContext });

    useDownloadTerms({
        "kcContext": kcContext as any,
        "downloadTermMarkdown": async ({ currentLanguageTag }) => {
            const resource = (() => {
                switch (currentLanguageTag) {
                    case "fr":
                        return tos_fr_url;
                    default:
                        return tos_en_url;
                }
            })();

            // webpack5 (used via storybook) loads markdown as string, not url
            if (resource.includes("\n")) return resource;

            const response = await fetch(resource);
            return response.text();
        }
    });

    if (i18n === null) {
        return null;
    }

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    default:
                        return <Fallback {...{ kcContext, i18n }} Template={DefaultTemplate} doUseDefaultCss={true} />;
                }
            })()}
        </Suspense>
    );
}
