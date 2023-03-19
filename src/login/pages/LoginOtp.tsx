import { useEffect } from "react";
import { headInsert } from "keycloakify/tools/headInsert";
import { pathJoin } from "keycloakify/bin/tools/pathJoin";
import { clsx } from "keycloakify/tools/clsx";
import { type PageProps, defaultClasses } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LoginOtp(props: PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        "defaultClasses": !doUseDefaultCss ? undefined : defaultClasses,
        classes
    });

    const { otpLogin, url } = kcContext;

    const { msg, msgStr } = i18n;

    useEffect(() => {
        let isCleanedUp = false;

        headInsert({
            "type": "javascript",
            "src": pathJoin(kcContext.url.resourcesCommonPath, "node_modules/jquery/dist/jquery.min.js")
        }).then(() => {
            if (isCleanedUp) return;

            evaluateInlineScript();
        });

        return () => {
            isCleanedUp = true;
        };
    }, []);

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            headerNode={msg("doLogIn")}
            formNode={
                <form id="kc-otp-login-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                    {otpLogin.userOtpCredentials.length > 1 && (
                        <div className={getClassName("kcFormGroupClass")}>
                            <div className={getClassName("kcInputWrapperClass")}>
                                {otpLogin.userOtpCredentials.map(otpCredential => (
                                    <div key={otpCredential.id} className={getClassName("kcSelectOTPListClass")}>
                                        <input type="hidden" value="${otpCredential.id}" />
                                        <div className={getClassName("kcSelectOTPListItemClass")}>
                                            <span className={getClassName("kcAuthenticatorOtpCircleClass")} />
                                            <h2 className={getClassName("kcSelectOTPItemHeadingClass")}>{otpCredential.userLabel}</h2>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className={getClassName("kcFormGroupClass")}>
                        <div className={getClassName("kcLabelWrapperClass")}>
                            <label htmlFor="otp" className={getClassName("kcLabelClass")}>
                                {msg("loginOtpOneTime")}
                            </label>
                        </div>

                        <div className={getClassName("kcInputWrapperClass")}>
                            <input id="otp" name="otp" autoComplete="off" type="text" className={getClassName("kcInputClass")} autoFocus />
                        </div>
                    </div>

                    <div className={getClassName("kcFormGroupClass")}>
                        <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
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
            }
        />
    );
}

declare const $: any;

function evaluateInlineScript() {
    $(document).ready(function () {
        // Card Single Select
        $(".card-pf-view-single-select").click(function (this: any) {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $(this).children().removeAttr("name");
            } else {
                $(".card-pf-view-single-select").removeClass("active");
                $(".card-pf-view-single-select").children().removeAttr("name");
                $(this).addClass("active");
                $(this).children().attr("name", "selectedCredentialId");
            }
        });

        var defaultCred = $(".card-pf-view-single-select")[0];
        if (defaultCred) {
            defaultCred.click();
        }
    });
}
