import { lazy, Suspense } from "react";
import { __unsafe_useI18n as useI18n } from "./i18n";
import type { KcContext } from "./kcContext/KcContext";
import type { PageProps } from "keycloakify/pages/PageProps";
import type { I18nBase } from "./i18n";
import type { SetOptional } from "./tools/SetOptional";

const DefaultTemplate = lazy(() => import("keycloakify/Template"));

const Login = lazy(() => import("keycloakify/pages/Login"));
const Register = lazy(() => import("keycloakify/pages/Register"));
const RegisterUserProfile = lazy(() => import("keycloakify/pages/RegisterUserProfile"));
const Info = lazy(() => import("keycloakify/pages/Info"));
const Error = lazy(() => import("keycloakify/pages/Error"));
const LoginResetPassword = lazy(() => import("keycloakify/pages/LoginResetPassword"));
const LoginVerifyEmail = lazy(() => import("keycloakify/pages/LoginVerifyEmail"));
const Terms = lazy(() => import("keycloakify/pages/Terms"));
const LoginOtp = lazy(() => import("keycloakify/pages/LoginOtp"));
const LoginPassword = lazy(() => import("keycloakify/pages/LoginPassword"));
const LoginUsername = lazy(() => import("keycloakify/pages/LoginUsername"));
const WebauthnAuthenticate = lazy(() => import("keycloakify/pages/WebauthnAuthenticate"));
const LoginUpdatePassword = lazy(() => import("keycloakify/pages/LoginUpdatePassword"));
const LoginUpdateProfile = lazy(() => import("keycloakify/pages/LoginUpdateProfile"));
const LoginIdpLinkConfirm = lazy(() => import("keycloakify/pages/LoginIdpLinkConfirm"));
const LoginPageExpired = lazy(() => import("keycloakify/pages/LoginPageExpired"));
const LoginIdpLinkEmail = lazy(() => import("keycloakify/pages/LoginIdpLinkEmail"));
const LoginConfigTotp = lazy(() => import("keycloakify/pages/LoginConfigTotp"));
const LogoutConfirm = lazy(() => import("keycloakify/pages/LogoutConfirm"));
const UpdateUserProfile = lazy(() => import("keycloakify/pages/UpdateUserProfile"));
const IdpReviewUserProfile = lazy(() => import("keycloakify/pages/IdpReviewUserProfile"));

export default function KcApp(props_: SetOptional<PageProps<KcContext, I18nBase>, "Template">) {
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
