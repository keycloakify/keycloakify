import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { PageProps } from "keycloakify/login/pages/PageProps";
import { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function LoginOauth2DeviceVerifyUserCode(
    props: PageProps<Extract<KcContext, { pageId: "login-oauth2-device-verify-user-code.ftl" }>>
) {
    const { kcContext, doUseDefaultCss, classes, Template } = props;
    const { url } = kcContext;

    const { msg, msgStr } = useI18n({ kcContext });

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    return (
        <Template kcContext={kcContext} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={msg("oauth2DeviceVerificationTitle")}>
            <form
                id="kc-user-verify-device-user-code-form"
                className={kcClsx("kcFormClass")}
                action={url.oauth2DeviceVerificationAction}
                method="post"
            >
                <div className={kcClsx("kcFormGroupClass")}>
                    <div className={kcClsx("kcLabelWrapperClass")}>
                        <label htmlFor="device-user-code" className={kcClsx("kcLabelClass")}>
                            {msg("verifyOAuth2DeviceUserCode")}
                        </label>
                    </div>

                    <div className={kcClsx("kcInputWrapperClass")}>
                        <input
                            id="device-user-code"
                            name="device_user_code"
                            autoComplete="off"
                            type="text"
                            className={kcClsx("kcInputClass")}
                            autoFocus
                        />
                    </div>
                </div>

                <div className={kcClsx("kcFormGroupClass")}>
                    <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
                        <div className={kcClsx("kcFormOptionsWrapperClass")}></div>
                    </div>

                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <div className={kcClsx("kcFormButtonsWrapperClass")}>
                            <input
                                className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonLargeClass")}
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
