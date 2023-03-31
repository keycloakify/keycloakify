import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "keycloakify/login/kcContext";
import type { I18n } from "keycloakify/login/i18n";
import { MouseEvent, useRef } from "react";
import { useConstCallback } from "keycloakify/tools/useConstCallback";

export default function SelectAuthenticator(props: PageProps<Extract<KcContext, { pageId: "select-authenticator.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
    const { url, auth } = kcContext;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });
    const { msg } = i18n;

    const selectCredentialsForm = useRef<HTMLFormElement>(null);
    const authExecIdInput = useRef<HTMLInputElement>(null);

    const submitForm = useConstCallback(() => {
        selectCredentialsForm.current?.submit();
    });

    const onSelectedAuthenticator = useConstCallback((event: MouseEvent<HTMLDivElement>) => {
        const divElement = event.currentTarget;
        const authExecId = divElement.dataset.authExecId;

        if (!authExecIdInput.current || !authExecId) {
            return;
        }

        authExecIdInput.current.value = authExecId;
        submitForm();
    });

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={msg("loginChooseAuthenticator")}>
            <form
                id="kc-select-credential-form"
                className={getClassName("kcFormClass")}
                ref={selectCredentialsForm}
                action={url.loginAction}
                method="post"
            >
                <div className={getClassName("kcSelectAuthListClass")}>
                    {auth.authenticationSelections.map((authenticationSelection, index) => (
                        <div key={index} className={getClassName("kcSelectAuthListItemClass")}>
                            <div
                                style={{ cursor: "pointer" }}
                                onClick={onSelectedAuthenticator}
                                data-auth-exec-id={authenticationSelection.authExecId}
                                className={getClassName("kcSelectAuthListItemInfoClass")}
                            >
                                <div className={getClassName("kcSelectAuthListItemLeftClass")}>
                                    <span className={getClassName(authenticationSelection.iconCssClass ?? "kcAuthenticatorDefaultClass")}></span>
                                </div>
                                <div className={getClassName("kcSelectAuthListItemBodyClass")}>
                                    <div className={getClassName("kcSelectAuthListItemDescriptionClass")}>
                                        <div className={getClassName("kcSelectAuthListItemHeadingClass")}>
                                            {msg(authenticationSelection.displayName)}
                                        </div>
                                        <div className={getClassName("kcSelectAuthListItemHelpTextClass")}>
                                            {msg(authenticationSelection.helpText)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <input type="hidden" id="authexec-hidden-input" name="authenticationExecution" ref={authExecIdInput} />
                </div>
            </form>
        </Template>
    );
}
