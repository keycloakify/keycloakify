import { useReducer, useEffect, memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "tss-react";
import { getCurrentKcLanguageTag } from "../i18n";
import type { KcLanguageTag, I18n } from "../i18n";

/** Allow to avoid bundling the terms and download it on demand*/
export function useDownloadTerms(params: {
    kcContext: KcContextBase;
    downloadTermMarkdown: (params: { currentKcLanguageTag: KcLanguageTag }) => Promise<string>;
    useI18n: () => I18n;
}) {
    const { kcContext, downloadTermMarkdown, useI18n } = params;

    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const { evtKcMessages } = useI18n();

    useEffect(() => {
        const currentKcLanguageTag = getCurrentKcLanguageTag(kcContext);

        downloadTermMarkdown({ currentKcLanguageTag }).then(thermMarkdown => {
            evtKcMessages.$attachOnce(
                kcMessages => (kcMessages !== undefined ? [kcMessages] : null),
                kcMessages => (kcMessages[currentKcLanguageTag].termsText = thermMarkdown),
            );

            forceUpdate();
        });
    }, []);
}

export const Terms = memo(({ kcContext, useI18n, ...props }: { kcContext: KcContextBase.Terms; useI18n: () => I18n } & KcProps) => {
    const { msg, msgStr } = useI18n();

    const { cx } = useCssAndCx();

    const { url } = kcContext;

    return (
        <Template
            {...{ kcContext, useI18n, ...props }}
            doFetchDefaultThemeResources={true}
            displayMessage={false}
            headerNode={msg("termsTitle")}
            formNode={
                <>
                    <div id="kc-terms-text">{msg("termsText")}</div>
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
