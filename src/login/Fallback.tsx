import { lazy, Suspense } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { assert, type Equals } from "tsafe/assert";
import type { I18n } from "./i18n";
import type { KcContext } from "./kcContext";

const Login = lazy(() => import("keycloakify/login/pages/Login"));
const Register = lazy(() => import("keycloakify/login/pages/Register"));
const RegisterUserProfile = lazy(() => import("keycloakify/login/pages/RegisterUserProfile"));
const Info = lazy(() => import("keycloakify/login/pages/Info"));
const Error = lazy(() => import("keycloakify/login/pages/Error"));
const LoginResetPassword = lazy(() => import("keycloakify/login/pages/LoginResetPassword"));
const LoginVerifyEmail = lazy(() => import("keycloakify/login/pages/LoginVerifyEmail"));
const Terms = lazy(() => import("keycloakify/login/pages/Terms"));
const LoginOtp = lazy(() => import("keycloakify/login/pages/LoginOtp"));
const LoginPassword = lazy(() => import("keycloakify/login/pages/LoginPassword"));
const LoginUsername = lazy(() => import("keycloakify/login/pages/LoginUsername"));
const WebauthnAuthenticate = lazy(() => import("keycloakify/login/pages/WebauthnAuthenticate"));
const LoginUpdatePassword = lazy(() => import("keycloakify/login/pages/LoginUpdatePassword"));
const LoginUpdateProfile = lazy(() => import("keycloakify/login/pages/LoginUpdateProfile"));
const LoginIdpLinkConfirm = lazy(() => import("keycloakify/login/pages/LoginIdpLinkConfirm"));
const LoginPageExpired = lazy(() => import("keycloakify/login/pages/LoginPageExpired"));
const LoginIdpLinkEmail = lazy(() => import("keycloakify/login/pages/LoginIdpLinkEmail"));
const LoginConfigTotp = lazy(() => import("keycloakify/login/pages/LoginConfigTotp"));
const LogoutConfirm = lazy(() => import("keycloakify/login/pages/LogoutConfirm"));
const UpdateUserProfile = lazy(() => import("keycloakify/login/pages/UpdateUserProfile"));
const IdpReviewUserProfile = lazy(() => import("keycloakify/login/pages/IdpReviewUserProfile"));
const UpdateEmail = lazy(() => import("keycloakify/login/pages/UpdateEmail"));

export default function Fallback(props: PageProps<KcContext, I18n>) {
    const { kcContext, ...rest } = props;

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return <Login kcContext={kcContext} {...rest} />;
                    case "register.ftl":
                        return <Register kcContext={kcContext} {...rest} />;
                    case "register-user-profile.ftl":
                        return <RegisterUserProfile kcContext={kcContext} {...rest} />;
                    case "info.ftl":
                        return <Info kcContext={kcContext} {...rest} />;
                    case "error.ftl":
                        return <Error kcContext={kcContext} {...rest} />;
                    case "login-reset-password.ftl":
                        return <LoginResetPassword kcContext={kcContext} {...rest} />;
                    case "login-verify-email.ftl":
                        return <LoginVerifyEmail kcContext={kcContext} {...rest} />;
                    case "terms.ftl":
                        return <Terms kcContext={kcContext} {...rest} />;
                    case "login-otp.ftl":
                        return <LoginOtp kcContext={kcContext} {...rest} />;
                    case "login-username.ftl":
                        return <LoginUsername kcContext={kcContext} {...rest} />;
                    case "login-password.ftl":
                        return <LoginPassword kcContext={kcContext} {...rest} />;
                    case "webauthn-authenticate.ftl":
                        return <WebauthnAuthenticate kcContext={kcContext} {...rest} />;
                    case "login-update-password.ftl":
                        return <LoginUpdatePassword kcContext={kcContext} {...rest} />;
                    case "login-update-profile.ftl":
                        return <LoginUpdateProfile kcContext={kcContext} {...rest} />;
                    case "login-idp-link-confirm.ftl":
                        return <LoginIdpLinkConfirm kcContext={kcContext} {...rest} />;
                    case "login-idp-link-email.ftl":
                        return <LoginIdpLinkEmail kcContext={kcContext} {...rest} />;
                    case "login-page-expired.ftl":
                        return <LoginPageExpired kcContext={kcContext} {...rest} />;
                    case "login-config-totp.ftl":
                        return <LoginConfigTotp kcContext={kcContext} {...rest} />;
                    case "logout-confirm.ftl":
                        return <LogoutConfirm kcContext={kcContext} {...rest} />;
                    case "update-user-profile.ftl":
                        return <UpdateUserProfile kcContext={kcContext} {...rest} />;
                    case "idp-review-user-profile.ftl":
                        return <IdpReviewUserProfile kcContext={kcContext} {...rest} />;
                    case "update-email.ftl":
                        return <UpdateEmail kcContext={kcContext} {...rest} />;
                }
                assert<Equals<typeof kcContext, never>>(false);
            })()}
        </Suspense>
    );
}
