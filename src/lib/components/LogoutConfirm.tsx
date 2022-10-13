import React, { memo } from "react";
import { useCssAndCx } from "../tools/useCssAndCx";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

export type LogoutConfirmProps = KcProps & {
    kcContext: KcContextBase.LogoutConfirm;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LogoutConfirm = memo((props: LogoutConfirmProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { url, client, logoutConfirm } = kcContext;

    const { cx } = useCssAndCx();

    const { msg, msgStr } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            displayMessage={false}
            headerNode={msg("logoutConfirmTitle")}
            formNode={
                <>
                    <div id="kc-logout-confirm" className="content-area">
                        <p className="instruction">{msg("logoutConfirmHeader")}</p>
                        <form className="form-actions" action={url.logoutConfirmAction} method="POST">
                            <input type="hidden" name="session_code" value={logoutConfirm.code} />
                            <div className={cx(kcProps.kcFormGroupClass)}>
                                <div id="kc-form-options">
                                    <div className={cx(kcProps.kcFormOptionsWrapperClass)}></div>
                                </div>
                                <div id="kc-form-buttons" className={cx(kcProps.kcFormGroupClass)}>
                                    <input
                                        tabIndex={4}
                                        className={cx(
                                            kcProps.kcButtonClass,
                                            kcProps.kcButtonPrimaryClass,
                                            kcProps.kcButtonBlockClass,
                                            kcProps.kcButtonLargeClass
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
