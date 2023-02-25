import React, { lazy, Suspense } from "react";
import { __unsafe_useI18n as useI18n } from "./i18n";
import DefaultTemplate from "./pages/Template";
import type { KcContextBase } from "./getKcContext/KcContextBase";
import type { PageProps } from "./KcProps";
import type { I18nBase } from "./i18n";
import type { SetOptional } from "./tools/SetOptional";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const RegisterUserProfile = lazy(() => import("./pages/RegisterUserProfile"));
const Info = lazy(() => import("./pages/Info"));
const Error = lazy(() => import("./pages/Error"));
const LoginResetPassword = lazy(() => import("./pages/LoginResetPassword"));
const LoginVerifyEmail = lazy(() => import("./pages/LoginVerifyEmail"));
const Terms = lazy(() => import("./pages/Terms"));
const LoginOtp = lazy(() => import("./pages/LoginOtp"));
const LoginPassword = lazy(() => import("./pages/LoginPassword"));
const LoginUsername = lazy(() => import("./pages/LoginUsername"));
const WebauthnAuthenticate = lazy(() => import("./pages/WebauthnAuthenticate"));
const LoginUpdatePassword = lazy(() => import("./pages/LoginUpdatePassword"));
const LoginUpdateProfile = lazy(() => import("./pages/LoginUpdateProfile"));
const LoginIdpLinkConfirm = lazy(() => import("./pages/LoginIdpLinkConfirm"));
const LoginPageExpired = lazy(() => import("./pages/LoginPageExpired"));
const LoginIdpLinkEmail = lazy(() => import("./pages/LoginIdpLinkEmail"));
const LoginConfigTotp = lazy(() => import("./pages/LoginConfigTotp"));
const LogoutConfirm = lazy(() => import("./pages/LogoutConfirm"));
const UpdateUserProfile = lazy(() => import("./pages/UpdateUserProfile"));
const IdpReviewUserProfile = lazy(() => import("./pages/IdpReviewUserProfile"));

export default function KcApp(props_: SetOptional<PageProps<KcContextBase, I18nBase>, "Template">) {
    const { kcContext, i18n: userProvidedI18n, Template = DefaultTemplate, ...kcProps } = props_;

    const i18n = (function useClosure() {
        const i18n = useI18n({
            kcContext,
            "extraMessages": {},
            "doSkip": userProvidedI18n !== undefined
        });

        return userProvidedI18n ?? i18n;
    })();

    if (i18n === null) {
        return null;
    }

    const commonProps = { i18n, Template, ...kcProps };

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return <Login {...{ kcContext, ...commonProps }} />;
                    case "register.ftl":
                        return <Register {...{ kcContext, ...commonProps }} />;
                    case "register-user-profile.ftl":
                        return <RegisterUserProfile {...{ kcContext, ...commonProps }} />;
                    case "info.ftl":
                        return <Info {...{ kcContext, ...commonProps }} />;
                    case "error.ftl":
                        return <Error {...{ kcContext, ...commonProps }} />;
                    case "login-reset-password.ftl":
                        return <LoginResetPassword {...{ kcContext, ...commonProps }} />;
                    case "login-verify-email.ftl":
                        return <LoginVerifyEmail {...{ kcContext, ...commonProps }} />;
                    case "terms.ftl":
                        return <Terms {...{ kcContext, ...commonProps }} />;
                    case "login-otp.ftl":
                        return <LoginOtp {...{ kcContext, ...commonProps }} />;
                    case "login-username.ftl":
                        return <LoginUsername {...{ kcContext, ...commonProps }} />;
                    case "login-password.ftl":
                        return <LoginPassword {...{ kcContext, ...commonProps }} />;
                    case "webauthn-authenticate.ftl":
                        return <WebauthnAuthenticate {...{ kcContext, ...commonProps }} />;
                    case "login-update-password.ftl":
                        return <LoginUpdatePassword {...{ kcContext, ...commonProps }} />;
                    case "login-update-profile.ftl":
                        return <LoginUpdateProfile {...{ kcContext, ...commonProps }} />;
                    case "login-idp-link-confirm.ftl":
                        return <LoginIdpLinkConfirm {...{ kcContext, ...commonProps }} />;
                    case "login-idp-link-email.ftl":
                        return <LoginIdpLinkEmail {...{ kcContext, ...commonProps }} />;
                    case "login-page-expired.ftl":
                        return <LoginPageExpired {...{ kcContext, ...commonProps }} />;
                    case "login-config-totp.ftl":
                        return <LoginConfigTotp {...{ kcContext, ...commonProps }} />;
                    case "logout-confirm.ftl":
                        return <LogoutConfirm {...{ kcContext, ...commonProps }} />;
                    case "update-user-profile.ftl":
                        return <UpdateUserProfile {...{ kcContext, ...commonProps }} />;
                    case "idp-review-user-profile.ftl":
                        return <IdpReviewUserProfile {...{ kcContext, ...commonProps }} />;
                }
            })()}
        </Suspense>
    );
}
