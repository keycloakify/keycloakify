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
import { LoginUpdatePassword } from "./LoginUpdatePassword";
import { LoginUpdateProfile } from "./LoginUpdateProfile";
import { LoginIdpLinkConfirm } from "./LoginIdpLinkConfirm";
import { LoginPageExpired } from "./LoginPageExpired";
import { LoginIdpLinkEmail } from "./LoginIdpLinkEmail";
import type { I18n } from "../i18n";

export const KcApp = memo(({ kcContext, useI18n, ...props }: { kcContext: KcContextBase; useI18n: () => I18n } & KcProps) => {
    switch (kcContext.pageId) {
        case "login.ftl":
            return <Login {...{ kcContext, useI18n, ...props }} />;
        case "register.ftl":
            return <Register {...{ kcContext, useI18n, ...props }} />;
        case "register-user-profile.ftl":
            return <RegisterUserProfile {...{ kcContext, useI18n, ...props }} />;
        case "info.ftl":
            return <Info {...{ kcContext, useI18n, ...props }} />;
        case "error.ftl":
            return <Error {...{ kcContext, useI18n, ...props }} />;
        case "login-reset-password.ftl":
            return <LoginResetPassword {...{ kcContext, useI18n, ...props }} />;
        case "login-verify-email.ftl":
            return <LoginVerifyEmail {...{ kcContext, useI18n, ...props }} />;
        case "terms.ftl":
            return <Terms {...{ kcContext, useI18n, ...props }} />;
        case "login-otp.ftl":
            return <LoginOtp {...{ kcContext, useI18n, ...props }} />;
        case "login-update-password.ftl":
            return <LoginUpdatePassword {...{ kcContext, useI18n, ...props }} />;
        case "login-update-profile.ftl":
            return <LoginUpdateProfile {...{ kcContext, useI18n, ...props }} />;
        case "login-idp-link-confirm.ftl":
            return <LoginIdpLinkConfirm {...{ kcContext, useI18n, ...props }} />;
        case "login-idp-link-email.ftl":
            return <LoginIdpLinkEmail {...{ kcContext, useI18n, ...props }} />;
        case "login-page-expired.ftl":
            return <LoginPageExpired {...{ kcContext, useI18n, ...props }} />;
    }
});
