import React, { lazy, memo, Suspense } from "react";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { KcProps } from "./KcProps";
import { __unsafe_useI18n as useI18n } from "../i18n";
import type { I18n } from "../i18n";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";

const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));
const RegisterUserProfile = lazy(() => import("./RegisterUserProfile"));
const Info = lazy(() => import("./Info"));
const Error = lazy(() => import("./Error"));
const LoginResetPassword = lazy(() => import("./LoginResetPassword"));
const LoginVerifyEmail = lazy(() => import("./LoginVerifyEmail"));
const Terms = lazy(() => import("./Terms"));
const LoginOtp = lazy(() => import("./LoginOtp"));
const LoginPassword = lazy(() => import("./LoginPassword"));
const LoginUsername = lazy(() => import("./LoginUsername"));
const WebauthnAuthenticate = lazy(() => import("./WebauthnAuthenticate"));
const LoginUpdatePassword = lazy(() => import("./LoginUpdatePassword"));
const LoginUpdateProfile = lazy(() => import("./LoginUpdateProfile"));
const LoginIdpLinkConfirm = lazy(() => import("./LoginIdpLinkConfirm"));
const LoginPageExpired = lazy(() => import("./LoginPageExpired"));
const LoginIdpLinkEmail = lazy(() => import("./LoginIdpLinkEmail"));
const LoginConfigTotp = lazy(() => import("./LoginConfigTotp"));
const LogoutConfirm = lazy(() => import("./LogoutConfirm"));
const UpdateUserProfile = lazy(() => import("./UpdateUserProfile"));
const IdpReviewUserProfile = lazy(() => import("./IdpReviewUserProfile"));

export type KcAppProps = KcProps & {
    kcContext: KcContextBase;
    i18n?: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const KcApp = memo((props_: KcAppProps) => {
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
});

export default KcApp;
