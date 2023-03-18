import { useEffect } from "react";
import { memoize } from "../tools/memoize";
import { fallbackLanguageTag } from "../i18n";
import { useConst } from "../tools/useConst";
import { useConstCallback } from "../tools/useConstCallback";
import { assert } from "tsafe/assert";
import { KcContext } from "../kcContext";
import { Evt } from "evt";

export const evtTermMarkdown = Evt.create<string | undefined>(undefined);

export type KcContextLike = {
    pageId: KcContext["pageId"];
    locale?: {
        currentLanguageTag: string;
    };
};

assert<KcContext extends KcContextLike ? true : false>();

/** Allow to avoid bundling the terms and download it on demand*/
export function useDownloadTerms(params: {
    kcContext: KcContextLike;
    downloadTermMarkdown: (params: { currentLanguageTag: string }) => Promise<string>;
}) {
    const { kcContext } = params;

    const { downloadTermMarkdownMemoized } = (function useClosure() {
        const { downloadTermMarkdown } = params;

        const downloadTermMarkdownConst = useConstCallback(downloadTermMarkdown);

        const downloadTermMarkdownMemoized = useConst(() =>
            memoize((currentLanguageTag: string) => downloadTermMarkdownConst({ currentLanguageTag }))
        );

        return { downloadTermMarkdownMemoized };
    })();

    useEffect(() => {
        if (kcContext.pageId !== "terms.ftl") {
            return;
        }

        downloadTermMarkdownMemoized(kcContext.locale?.currentLanguageTag ?? fallbackLanguageTag).then(
            thermMarkdown => (evtTermMarkdown.state = thermMarkdown)
        );
    }, []);
}
