import { lazy, memo, Suspense } from "react";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { KcProps } from "./KcProps";

const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));
const RegisterUserProfile = lazy(() => import("./RegisterUserProfile"));
const Info = lazy(() => import("./Info"));
const Error = lazy(() => import("./Error"));
const LoginResetPassword = lazy(() => import("./LoginResetPassword"));
const LoginVerifyEmail = lazy(() => import("./LoginVerifyEmail"));
const Terms = lazy(() => import("./Terms"));
const LoginOtp = lazy(() => import("./LoginOtp"));
const LoginUpdatePassword = lazy(() => import("./LoginUpdatePassword"));
const LoginUpdateProfile = lazy(() => import("./LoginUpdateProfile"));
const LoginIdpLinkConfirm = lazy(() => import("./LoginIdpLinkConfirm"));
const LoginPageExpired = lazy(() => import("./LoginPageExpired"));
const LoginIdpLinkEmail = lazy(() => import("./LoginIdpLinkEmail"));
const LoginConfigTotp = lazy(() => import("./LoginConfigTotp"));
const LogoutConfirm = lazy(() => import("./LogoutConfirm"));

const KcApp = memo(({ kcContext, ...props }: { kcContext: KcContextBase } & KcProps) => {
    return (
        <Suspense fallback={null}>
            {(() => {
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
                    case "login-idp-link-email.ftl":
                        return <LoginIdpLinkEmail {...{ kcContext, ...props }} />;
                    case "login-page-expired.ftl":
                        return <LoginPageExpired {...{ kcContext, ...props }} />;
                    case "login-config-totp.ftl":
                        return <LoginConfigTotp {...{ kcContext, ...props }} />;
                    case "logout-confirm.ftl":
                        return <LogoutConfirm {...{ kcContext, ...props }} />;
                }
            })()}
        </Suspense>
    );
});

export default KcApp;
