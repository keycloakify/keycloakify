import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import './LoginVerifyEmail.scss';

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg } = i18n;

    const { url, user } = kcContext;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo
            headerNode={msg("emailVerifyTitle")}
            infoNode={""}
        >
            <div className="main-container">
                <div className="header1">
                    Email Verification
                </div>
                <div>

                <div className="inner-text">
                    An email with instructions to verify your email has been sent to your address <b>{user?.email}</b>.
                </div>
                <div className="last-text">
                    Haven't received a Verification code in your email?
                    <br />
                    <a href={url.loginAction}>Click Here</a> to re-send the email.
                </div>
                </div>
            </div>
        </Template>
    );
}
