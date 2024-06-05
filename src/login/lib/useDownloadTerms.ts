import { fallbackLanguageTag } from "keycloakify/login/i18n";
import { assert } from "tsafe/assert";
import {
    createStatefulObservable,
    useRerenderOnChange
} from "keycloakify/tools/StatefulObservable";
import { useOnFistMount } from "keycloakify/tools/useOnFirstMount";
import { KcContext } from "../KcContext";

const obsTermsMarkdown = createStatefulObservable<string | undefined>(() => undefined);

export type KcContextLike = {
    pageId: string;
    locale?: {
        currentLanguageTag: string;
    };
    termsAcceptanceRequired?: boolean;
};

assert<KcContext extends KcContextLike ? true : false>();

/** Allow to avoid bundling the terms and download it on demand*/
export function useDownloadTerms(params: {
    kcContext: KcContextLike;
    downloadTermMarkdown: (params: { currentLanguageTag: string }) => Promise<string>;
}) {
    const { kcContext, downloadTermMarkdown } = params;

    useOnFistMount(async () => {
        if (kcContext.pageId === "terms.ftl" || kcContext.termsAcceptanceRequired) {
            const termsMarkdown = await downloadTermMarkdown({
                currentLanguageTag:
                    kcContext.locale?.currentLanguageTag ?? fallbackLanguageTag
            });

            obsTermsMarkdown.current = termsMarkdown;
        }
    });
}

export function useTermsMarkdown() {
    useRerenderOnChange(obsTermsMarkdown);

    const termsMarkdown = obsTermsMarkdown.current;

    return { termsMarkdown };
}
