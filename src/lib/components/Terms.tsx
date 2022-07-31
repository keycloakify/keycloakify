import React, { useEffect, memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useI18n } from "../i18n";
import { useCssAndCx } from "tss-react";
import { Evt } from "evt";
import { useRerenderOnStateChange } from "evt/hooks";

export const evtTermMarkdown = Evt.create<string | undefined>(undefined);

/** Allow to avoid bundling the terms and download it on demand*/
export function useDownloadTerms(params: { downloadTermMarkdown: (params: { currentLanguageTag: string }) => Promise<string> }) {
    const { downloadTermMarkdown } = params;

    const { currentLanguageTag } = useI18n();

    useEffect(() => {
        let isMounted = true;

        downloadTermMarkdown({ currentLanguageTag }).then(thermMarkdown => {
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

const Terms = memo(({ kcContext, ...props }: { kcContext: KcContextBase.Terms } & KcProps) => {
    const { msg, msgStr } = useI18n();

    useRerenderOnStateChange(evtTermMarkdown);

    const { cx } = useCssAndCx();

    const { url } = kcContext;

    if (evtTermMarkdown.state === undefined) {
        return null;
    }

    return (
        <Template
            {...{ kcContext, ...props }}
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
