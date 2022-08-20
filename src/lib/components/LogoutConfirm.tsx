import React, { memo } from "react";
import { useCssAndCx } from "tss-react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

const LogoutConfirm = memo(({ kcContext, i18n, ...props }: { kcContext: KcContextBase.LogoutConfirm; i18n: I18n } & KcProps) => {
    const { url, client, logoutConfirm } = kcContext;

    const { cx } = useCssAndCx();

    const { msg, msgStr } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, ...props }}
            doFetchDefaultThemeResources={true}
            displayMessage={false}
            headerNode={msg("logoutConfirmTitle")}
            formNode={
                <>
                    <div id="kc-logout-confirm" className="content-area">
                        <p className="instruction">{msg("logoutConfirmHeader")}</p>
                        <form className="form-actions" action={url.logoutConfirmAction} method="POST">
                            <input type="hidden" name="session_code" value={logoutConfirm.code} />
                            <div className={cx(props.kcFormGroupClass)}>
                                <div id="kc-form-options">
                                    <div className={cx(props.kcFormOptionsWrapperClass)}></div>
                                </div>
                                <div id="kc-form-buttons" className={cx(props.kcFormGroupClass)}>
                                    <input
                                        tabIndex={4}
                                        className={cx(
                                            props.kcButtonClass,
                                            props.kcButtonPrimaryClass,
                                            props.kcButtonBlockClass,
                                            props.kcButtonLargeClass
                                        )}
                                        name="confirmLogout"
                                        id="kc-logout"
                                        type="submit"
                                        value={msgStr("doLogout")}
                                    />
                                </div>
                            </div>
                        </form>
                        <div id="kc-info-message">
                            {!logoutConfirm.skipLink && client.baseUrl && (
                                <p>
                                    <a href={client.baseUrl} dangerouslySetInnerHTML={{ __html: msgStr("backToApplication") }} />
                                </p>
                            )}
                        </div>
                    </div>
                </>
            }
        />
    );
});

export default LogoutConfirm;
