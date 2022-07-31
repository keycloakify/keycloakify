import React, { useEffect, memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "tss-react";
import { Evt } from "evt";
import { useRerenderOnStateChange } from "evt/hooks";
import { assert } from "tsafe/assert";
import { fallbackLanguageTag } from "../i18n";
import type { I18n } from "../i18n";

export const evtTermMarkdown = Evt.create<string | undefined>(undefined);

export type KcContextLike = {
    locale?: {
        currentLanguageTag: string;
    };
};

assert<KcContextBase extends KcContextLike ? true : false>();

/** Allow to avoid bundling the terms and download it on demand*/
export function useDownloadTerms(params: {
    kcContext: KcContextLike;
    downloadTermMarkdown: (params: { currentLanguageTag: string }) => Promise<string>;
}) {
    const { kcContext, downloadTermMarkdown } = params;

    useEffect(() => {
        let isMounted = true;

        downloadTermMarkdown({
            "currentLanguageTag": kcContext.locale?.currentLanguageTag ?? fallbackLanguageTag,
        }).then(thermMarkdown => {
            if (!isMounted) {
                return;
            }

            evtTermMarkdown.state = thermMarkdown;
        });

        return () => {
            isMounted = false;
        };
    }, []);
}

const Terms = memo(({ kcContext, i18n, ...props }: { kcContext: KcContextBase.Terms; i18n: I18n } & KcProps) => {
    const { msg, msgStr } = i18n;

    useRerenderOnStateChange(evtTermMarkdown);

    const { cx } = useCssAndCx();

    const { url } = kcContext;

    if (evtTermMarkdown.state === undefined) {
        return null;
    }

    return (
        <Template
            {...{ kcContext, i18n, ...props }}
            doFetchDefaultThemeResources={true}
            displayMessage={false}
            headerNode={msg("termsTitle")}
            formNode={
                <>
                    <div id="kc-terms-text">{evtTermMarkdown.state}</div>
                    <form className="form-actions" action={url.loginAction} method="POST">
                        <input
                            className={cx(
                                props.kcButtonClass,
                                props.kcButtonClass,
                                props.kcButtonClass,
                                props.kcButtonPrimaryClass,
                                props.kcButtonLargeClass,
                            )}
                            name="accept"
                            id="kc-accept"
                            type="submit"
                            value={msgStr("doAccept")}
                        />
                        <input
                            className={cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonLargeClass)}
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
