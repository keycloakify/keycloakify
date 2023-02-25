import React, { useEffect } from "react";
import { memoize } from "../tools/memoize";
import { clsx } from "../tools/clsx";
import { Evt } from "evt";
import { useRerenderOnStateChange } from "evt/hooks";
import { assert } from "tsafe/assert";
import { fallbackLanguageTag } from "../i18n";
import { useConst } from "../tools/useConst";
import { useConstCallback } from "../tools/useConstCallback";
import { Markdown } from "../tools/Markdown";
import type { Extends } from "tsafe";
import type { KcContextBase } from "../kcContext";
import type { PageProps } from "../KcProps";
import type { I18nBase } from "../i18n";

export default function Terms(props: PageProps<KcContextBase.Terms, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { msg, msgStr } = i18n;

    useRerenderOnStateChange(evtTermMarkdown);

    const { url } = kcContext;

    if (evtTermMarkdown.state === undefined) {
        return null;
    }

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            displayMessage={false}
            headerNode={msg("termsTitle")}
            formNode={
                <>
                    <div id="kc-terms-text">{evtTermMarkdown.state && <Markdown>{evtTermMarkdown.state}</Markdown>}</div>
                    <form className="form-actions" action={url.loginAction} method="POST">
                        <input
                            className={clsx(
                                kcProps.kcButtonClass,
                                kcProps.kcButtonClass,
                                kcProps.kcButtonClass,
                                kcProps.kcButtonPrimaryClass,
                                kcProps.kcButtonLargeClass
                            )}
                            name="accept"
                            id="kc-accept"
                            type="submit"
                            value={msgStr("doAccept")}
                        />
                        <input
                            className={clsx(kcProps.kcButtonClass, kcProps.kcButtonDefaultClass, kcProps.kcButtonLargeClass)}
                            name="cancel"
                            id="kc-decline"
                            type="submit"
                            value={msgStr("doDecline")}
                        />
                    </form>
                    <div className="clearfix" />
                </>
            }
        />
    );
}

export const evtTermMarkdown = Evt.create<string | undefined>(undefined);

export type KcContextLike = {
    pageId: KcContextBase["pageId"];
    locale?: {
        currentLanguageTag: string;
    };
};

assert<Extends<KcContextBase, KcContextLike>>();

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
