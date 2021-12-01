import { memo } from "react";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { KcProps } from "./KcProps";
import { Login } from "./Login";
import { Register } from "./Register";
import { RegisterUserProfile } from "./RegisterUserProfile";
import { Info } from "./Info";
import { Error } from "./Error";
import { LoginResetPassword } from "./LoginResetPassword";
import { LoginVerifyEmail } from "./LoginVerifyEmail";
import { Terms } from "./Terms";
import { LoginOtp } from "./LoginOtp";
import { LoginUpdateProfile } from "./LoginUpdateProfile";
import { LoginIdpLinkConfirm } from "./LoginIdpLinkConfirm";

export const KcApp = memo(({ kcContext, ...props }: { kcContext: KcContextBase } & KcProps) => {
    switch (kcContext.pageId) {
        case "login.ftl":
            return <Login {...{ kcContext, ...props }} />;
        case "register.ftl":
            return <Register {...{ kcContext, ...props }} />;
        case "register-user-profile.ftl":
            return <RegisterUserProfile {...{ kcContext, ...props }} />;
        case "info.ftl":
            return <Info {...{ kcContext, ...props }} />;
        case "error.ftl":
            return <Error {...{ kcContext, ...props }} />;
        case "login-reset-password.ftl":
            return <LoginResetPassword {...{ kcContext, ...props }} />;
        case "login-verify-email.ftl":
            return <LoginVerifyEmail {...{ kcContext, ...props }} />;
        case "terms.ftl":
            return <Terms {...{ kcContext, ...props }} />;
        case "login-otp.ftl":
            return <LoginOtp {...{ kcContext, ...props }} />;
        case "login-update-profile.ftl":
            return <LoginUpdateProfile {...{ kcContext, ...props }} />;
        case "login-idp-link-confirm.ftl":
            return <LoginIdpLinkConfirm {...{ kcContext, ...props }} />;
        case "login-config-totp.ftl":
            return null;
        case "saml-post-form.ftl":
            return null;
        // case "code.ftl":
        //     return null;
        // case "delete-account-confirm.ftl":
        //     return null;
        // case "idp-review-user-profile.ftl":
        //     return null;
        // case "login-config-totp-text.ftl":
        //     return null;
        // case "login-idp-link-email.ftl":
        //     return null;
        // case "login-oauth2-device-verify-user-code.ftl":
        //     return null;
        // case "login-oauth-grant.ftl":
        //     return null;
        // case "login-page-expired.ftl":
        //     return null;
        // case "login-password.ftl":
        //     return null;
        // case "login-update-password.ftl":
        //     return null;
        // case "login-username.ftl":
        //     return null;
        // case "login-verify-email-code-text.ftl":
        //     return null;
        // case "login-x509-info.ftl":
        //     return null;
        // case "select-authenticator.ftl":
        //     return null;
        // case "update-user-profile.ftl":
        //     return null;
        // case "webauthn-authenticate.ftl":
        //     return null;
        // case "webauthn-error.ftl":
        //     return null;
        // case "webauthn-register.ftl":
        //     return null;
    }
});
