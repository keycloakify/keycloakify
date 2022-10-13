import React, { useEffect, memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import { Evt } from "evt";
import { useRerenderOnStateChange } from "evt/hooks";
import { assert } from "tsafe/assert";
import { fallbackLanguageTag } from "../i18n";
import type { I18n } from "../i18n";
import memoize from "memoizee";
import { useConst } from "powerhooks/useConst";
import { useConstCallback } from "powerhooks/useConstCallback";
import { Markdown } from "../tools/Markdown";
import type { Extends } from "tsafe";

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
            memoize((currentLanguageTag: string) => downloadTermMarkdownConst({ currentLanguageTag }), { "promise": true })
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

export type TermsProps = KcProps & {
    kcContext: KcContextBase.Terms;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const Terms = memo((props: TermsProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { msg, msgStr } = i18n;

    useRerenderOnStateChange(evtTermMarkdown);

    const { cx } = useCssAndCx();

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
                            className={cx(
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
                            className={cx(kcProps.kcButtonClass, kcProps.kcButtonDefaultClass, kcProps.kcButtonLargeClass)}
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
});

export default Terms;
