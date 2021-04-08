import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContext } from "../KcContext";
import { useKcMessage } from "../i18n/useKcMessage";
import { cx } from "tss-react";

export const Terms = memo(({ kcContext, ...props }: { kcContext: KcContext.Terms; } & KcProps) => {

    const { msg, msgStr } = useKcMessage();

    const { url } = kcContext;

    return (
        <Template
            {...{ kcContext, ...props }}
            displayMessage={false}
            headerNode={msg("termsTitle")}
            formNode={
                <>
                    <div id="kc-terms-text">
                        {msg("termsText")}
                    </div>
                    <form className="form-actions" action={url.loginAction} method="POST">
                        <input
                            className={cx(
                                props.kcButtonClass,
                                props.kcButtonClass,
                                props.kcButtonClass,
                                props.kcButtonPrimaryClass,
                                props.kcButtonLargeClass
                            )}
                            name="accept"
                            id="kc-accept"
                            type="submit"
                            value={msgStr("doAccept")}
                        />
                        <input
                            className={cx(
                                props.kcButtonClass,
                                props.kcButtonDefaultClass,
                                props.kcButtonLargeClass
                            )}
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


