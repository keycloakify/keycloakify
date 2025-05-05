import type { JSXElement } from "keycloakify/tools/JSX";
import { lazy, Suspense } from "react";
import { assert, type Equals } from "tsafe/assert";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { I18n } from "keycloakify/login/i18n";
import type { KcContext } from "keycloakify/login/KcContext";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";

const Login = lazy(() => import("keycloakify/login/pages/Login"));
const Register = lazy(() => import("keycloakify/login/pages/Register"));
const Info = lazy(() => import("keycloakify/login/pages/Info"));
const Error = lazy(() => import("keycloakify/login/pages/Error"));
const LoginResetPassword = lazy(() => import("keycloakify/login/pages/LoginResetPassword"));
const LoginVerifyEmail = lazy(() => import("keycloakify/login/pages/LoginVerifyEmail"));
const Terms = lazy(() => import("keycloakify/login/pages/Terms"));
const LoginOauth2DeviceVerifyUserCode = lazy(() => import("keycloakify/login/pages/LoginOauth2DeviceVerifyUserCode"));
const LoginOauthGrant = lazy(() => import("keycloakify/login/pages/LoginOauthGrant"));
const LoginOtp = lazy(() => import("keycloakify/login/pages/LoginOtp"));
const LoginPassword = lazy(() => import("keycloakify/login/pages/LoginPassword"));
const LoginUsername = lazy(() => import("keycloakify/login/pages/LoginUsername"));
const WebauthnAuthenticate = lazy(() => import("keycloakify/login/pages/WebauthnAuthenticate"));
const WebauthnRegister = lazy(() => import("keycloakify/login/pages/WebauthnRegister"));
const LoginUpdatePassword = lazy(() => import("keycloakify/login/pages/LoginUpdatePassword"));
const LoginUpdateProfile = lazy(() => import("keycloakify/login/pages/LoginUpdateProfile"));
const LoginIdpLinkConfirm = lazy(() => import("keycloakify/login/pages/LoginIdpLinkConfirm"));
const LoginPageExpired = lazy(() => import("keycloakify/login/pages/LoginPageExpired"));
const LoginIdpLinkEmail = lazy(() => import("keycloakify/login/pages/LoginIdpLinkEmail"));
const LoginConfigTotp = lazy(() => import("keycloakify/login/pages/LoginConfigTotp"));
const LogoutConfirm = lazy(() => import("keycloakify/login/pages/LogoutConfirm"));
const IdpReviewUserProfile = lazy(() => import("keycloakify/login/pages/IdpReviewUserProfile"));
const UpdateEmail = lazy(() => import("keycloakify/login/pages/UpdateEmail"));
const SelectAuthenticator = lazy(() => import("keycloakify/login/pages/SelectAuthenticator"));
const SamlPostForm = lazy(() => import("keycloakify/login/pages/SamlPostForm"));
const DeleteCredential = lazy(() => import("keycloakify/login/pages/DeleteCredential"));
const Code = lazy(() => import("keycloakify/login/pages/Code"));
const DeleteAccountConfirm = lazy(() => import("keycloakify/login/pages/DeleteAccountConfirm"));
const FrontchannelLogout = lazy(() => import("keycloakify/login/pages/FrontchannelLogout"));
const LoginRecoveryAuthnCodeConfig = lazy(() => import("keycloakify/login/pages/LoginRecoveryAuthnCodeConfig"));
const LoginRecoveryAuthnCodeInput = lazy(() => import("keycloakify/login/pages/LoginRecoveryAuthnCodeInput"));
const LoginResetOtp = lazy(() => import("keycloakify/login/pages/LoginResetOtp"));
const LoginX509Info = lazy(() => import("keycloakify/login/pages/LoginX509Info"));
const WebauthnError = lazy(() => import("keycloakify/login/pages/WebauthnError"));
const LoginPasskeysConditionalAuthenticate = lazy(() => import("keycloakify/login/pages/LoginPasskeysConditionalAuthenticate"));
const LoginIdpLinkConfirmOverride = lazy(() => import("keycloakify/login/pages/LoginIdpLinkConfirmOverride"));

type DefaultPageProps = PageProps<KcContext, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSXElement>;
    doMakeUserConfirmPassword: boolean;
};

export default function DefaultPage(props: DefaultPageProps) {
    const { kcContext, ...rest } = props;

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return <Login kcContext={kcContext} {...rest} />;
                    case "register.ftl":
                        return <Register kcContext={kcContext} {...rest} />;
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
                    case "login-oauth2-device-verify-user-code.ftl":
                        return <LoginOauth2DeviceVerifyUserCode kcContext={kcContext} {...rest} />;
                    case "login-oauth-grant.ftl":
                        return <LoginOauthGrant kcContext={kcContext} {...rest} />;
                    case "login-otp.ftl":
                        return <LoginOtp kcContext={kcContext} {...rest} />;
                    case "login-username.ftl":
                        return <LoginUsername kcContext={kcContext} {...rest} />;
                    case "login-password.ftl":
                        return <LoginPassword kcContext={kcContext} {...rest} />;
                    case "webauthn-authenticate.ftl":
                        return <WebauthnAuthenticate kcContext={kcContext} {...rest} />;
                    case "webauthn-register.ftl":
                        return <WebauthnRegister kcContext={kcContext} {...rest} />;
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
                    case "idp-review-user-profile.ftl":
                        return <IdpReviewUserProfile kcContext={kcContext} {...rest} />;
                    case "update-email.ftl":
                        return <UpdateEmail kcContext={kcContext} {...rest} />;
                    case "select-authenticator.ftl":
                        return <SelectAuthenticator kcContext={kcContext} {...rest} />;
                    case "saml-post-form.ftl":
                        return <SamlPostForm kcContext={kcContext} {...rest} />;
                    case "delete-credential.ftl":
                        return <DeleteCredential kcContext={kcContext} {...rest} />;
                    case "code.ftl":
                        return <Code kcContext={kcContext} {...rest} />;
                    case "delete-account-confirm.ftl":
                        return <DeleteAccountConfirm kcContext={kcContext} {...rest} />;
                    case "frontchannel-logout.ftl":
                        return <FrontchannelLogout kcContext={kcContext} {...rest} />;
                    case "login-recovery-authn-code-config.ftl":
                        return <LoginRecoveryAuthnCodeConfig kcContext={kcContext} {...rest} />;
                    case "login-recovery-authn-code-input.ftl":
                        return <LoginRecoveryAuthnCodeInput kcContext={kcContext} {...rest} />;
                    case "login-reset-otp.ftl":
                        return <LoginResetOtp kcContext={kcContext} {...rest} />;
                    case "login-x509-info.ftl":
                        return <LoginX509Info kcContext={kcContext} {...rest} />;
                    case "webauthn-error.ftl":
                        return <WebauthnError kcContext={kcContext} {...rest} />;
                    case "login-passkeys-conditional-authenticate.ftl":
                        return <LoginPasskeysConditionalAuthenticate kcContext={kcContext} {...rest} />;
                    case "login-idp-link-confirm-override.ftl":
                        return <LoginIdpLinkConfirmOverride kcContext={kcContext} {...rest} />;
                }
                assert<Equals<typeof kcContext, never>>(false);
            })()}
        </Suspense>
    );
}
