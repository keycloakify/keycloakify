import { fallbackLanguageTag } from "keycloakify/login/i18n";
import { assert } from "tsafe/assert";
import {
    createStatefulObservable,
    useRerenderOnChange
} from "keycloakify/tools/StatefulObservable";
import { useOnFistMount } from "keycloakify/tools/useOnFirstMount";
import { KcContext } from "../KcContext";

const obs = createStatefulObservable<
    | {
          termsMarkdown: string;
          termsLanguageTag: string;
      }
    | undefined
>(() => undefined);

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
    downloadTermsMarkdown: (params: {
        currentLanguageTag: string;
    }) => Promise<{ termsMarkdown: string; termsLanguageTag: string }>;
}) {
    const { kcContext, downloadTermsMarkdown } = params;

    useOnFistMount(async () => {
        if (kcContext.pageId === "terms.ftl" || kcContext.termsAcceptanceRequired) {
            obs.current = await downloadTermsMarkdown({
                currentLanguageTag:
                    kcContext.locale?.currentLanguageTag ?? fallbackLanguageTag
            });
        }
    });
}

export function useTermsMarkdown() {
    useRerenderOnChange(obs);

    if (obs.current === undefined) {
        return { isDownloadComplete: false as const };
    }

    const { termsMarkdown, termsLanguageTag } = obs.current;

    return { isDownloadComplete: true, termsMarkdown, termsLanguageTag };
}
