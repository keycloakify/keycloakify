export const loginThemePageIds = [
    "login.ftl",
    "login-username.ftl",
    "login-password.ftl",
    "webauthn-authenticate.ftl",
    "webauthn-register.ftl",
    "register.ftl",
    "info.ftl",
    "error.ftl",
    "login-reset-password.ftl",
    "login-verify-email.ftl",
    "terms.ftl",
    "login-oauth2-device-verify-user-code.ftl",
    "login-oauth-grant.ftl",
    "login-otp.ftl",
    "login-update-profile.ftl",
    "login-update-password.ftl",
    "login-idp-link-confirm.ftl",
    "login-idp-link-email.ftl",
    "login-page-expired.ftl",
    "login-config-totp.ftl",
    "logout-confirm.ftl",
    "idp-review-user-profile.ftl",
    "update-email.ftl",
    "select-authenticator.ftl",
    "saml-post-form.ftl",
    "delete-credential.ftl",
    "code.ftl",
    "delete-account-confirm.ftl",
    "frontchannel-logout.ftl",
    "login-recovery-authn-code-config.ftl",
    "login-recovery-authn-code-input.ftl",
    "login-reset-otp.ftl",
    "login-x509-info.ftl",
    "webauthn-error.ftl"
] as const;

export const accountThemePageIds = [
    "password.ftl",
    "account.ftl",
    "sessions.ftl",
    "totp.ftl",
    "applications.ftl",
    "log.ftl",
    "federatedIdentity.ftl"
] as const;

export type LoginThemePageId = (typeof loginThemePageIds)[number];
export type AccountThemePageId = (typeof accountThemePageIds)[number];