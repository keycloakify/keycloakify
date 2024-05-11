import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LoginRecoveryAuthnCodeInput(props: PageProps<Extract<KcContext, { pageId: "login-recovery-authn-code-input.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { url, messagesPerField, recoveryAuthnCodesInputBean } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            headerNode={msg("auth-recovery-code-header")}
            displayMessage={!messagesPerField.existsError("recoveryCodeInput")}
        >
            <form id="kc-recovery-code-login-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <div className={getClassName("kcFormGroupClass")}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="recoveryCodeInput" className={getClassName("kcLabelClass")}>
                            {msg("auth-recovery-code-prompt", `${recoveryAuthnCodesInputBean.codeNumber}`)}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            tabIndex={1}
                            id="recoveryCodeInput"
                            name="recoveryCodeInput"
                            aria-invalid={messagesPerField.existsError("recoveryCodeInput")}
                            autoComplete="off"
                            type="text"
                            className={getClassName("kcInputClass")}
                            autoFocus
                        />
                        {messagesPerField.existsError("recoveryCodeInput") && (
                            <span id="input-error" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                {messagesPerField.get("recoveryCodeInput")}
                            </span>
                        )}
                    </div>
                </div>

                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-options" className={getClassName("kcFormOptionsWrapperClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")} />
                    </div>
                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <input
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            name="login"
                            id="kc-login"
                            type="submit"
                            value={msgStr("doLogIn")}
                        />
                    </div>
                </div>
            </form>
        </Template>
    );
}
