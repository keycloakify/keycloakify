import React, { lazy, Suspense } from "react";
import Fallback from "../../dist/login";
import type { KcContext } from "./kcContext";
import { useI18n } from "./i18n";

const DefaultTemplate = lazy(() => import("../../dist/login/Template"));

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const i18n = useI18n({ kcContext });

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
