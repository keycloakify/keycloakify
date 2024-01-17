import { clsx } from "keycloakify/tools/clsx";
import { I18n } from "../i18n";
import { KcContext } from "../kcContext";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import { PageProps } from "./PageProps";

export default function LoginOauthGrant(props: PageProps<Extract<KcContext, { pageId: "login-oauth2-device-verify-user-code.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, classes, Template } = props;
    const { url } = kcContext;

    const { msg, msgStr } = i18n;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={msg("oauth2DeviceVerificationTitle")}>
            <form
                id="kc-user-verify-device-user-code-form"
                className={getClassName("kcFormClass")}
                action={url.oauth2DeviceVerificationAction}
                method="post"
            >
                <div className={getClassName("kcFormGroupClass")}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="device-user-code" className={getClassName("kcLabelClass")}>
                            {msg("verifyOAuth2DeviceUserCode")}
                        </label>
                    </div>

                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            id="device-user-code"
                            name="device_user_code"
                            autoComplete="off"
                            type="text"
                            className={getClassName("kcInputClass")}
                            autoFocus
                        />
                    </div>
                </div>

                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")}></div>
                    </div>

                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <div className={getClassName("kcFormButtonsWrapperClass")}>
                            <input
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonPrimaryClass"),
                                    getClassName("kcButtonLargeClass")
                                )}
                                type="submit"
                                value={msgStr("doSubmit")}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
