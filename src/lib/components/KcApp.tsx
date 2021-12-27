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
        case "login-update-password.ftl":
            return <LoginUpdatePassword {...{ kcContext, ...props }} />;
        case "login-update-profile.ftl":
            return <LoginUpdateProfile {...{ kcContext, ...props }} />;
        case "login-idp-link-confirm.ftl":
            return <LoginIdpLinkConfirm {...{ kcContext, ...props }} />;
    }
});
