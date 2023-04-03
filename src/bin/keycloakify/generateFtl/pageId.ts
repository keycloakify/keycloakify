export const loginThemePageIds = [
    "login.ftl",
    "login-username.ftl",
    "login-password.ftl",
    "webauthn-authenticate.ftl",
    "register.ftl",
    "register-user-profile.ftl",
    "info.ftl",
    "error.ftl",
    "login-reset-password.ftl",
    "login-verify-email.ftl",
    "terms.ftl",
    "login-otp.ftl",
    "login-update-profile.ftl",
    "login-update-password.ftl",
    "login-idp-link-confirm.ftl",
    "login-idp-link-email.ftl",
    "login-page-expired.ftl",
    "login-config-totp.ftl",
    "logout-confirm.ftl",
    "update-user-profile.ftl",
    "idp-review-user-profile.ftl",
    "update-email.ftl",
    "select-authenticator.ftl"
] as const;

export const accountThemePageIds = ["password.ftl", "account.ftl"] as const;

export type LoginThemePageId = (typeof loginThemePageIds)[number];
export type AccountThemePageId = (typeof accountThemePageIds)[number];
