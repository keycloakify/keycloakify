export const KEYCLOAK_RESOURCES = "keycloak-resources";
export const RESOURCES_COMMON = "resources-common";
export const LAST_KEYCLOAK_VERSION_WITH_ACCOUNT_V1 = "21.1.2";
export const BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR = "dist";

export const THEME_TYPES = ["login", "account"] as const;
export const ACCOUNT_V1_THEME_NAME = "account-v1";

export type ThemeType = (typeof THEME_TYPES)[number];

export const VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES = {
    RUN_POST_BUILD_SCRIPT: "KEYCLOAKIFY_RUN_POST_BUILD_SCRIPT",
    RESOLVE_VITE_CONFIG: "KEYCLOAKIFY_RESOLVE_VITE_CONFIG"
} as const;

export const BUILD_FOR_KEYCLOAK_MAJOR_VERSION_ENV_NAME =
    "KEYCLOAKIFY_BUILD_FOR_KEYCLOAK_MAJOR_VERSION";

export const LOGIN_THEME_PAGE_IDS = [
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

export const ACCOUNT_THEME_PAGE_IDS = [
    "password.ftl",
    "account.ftl",
    "sessions.ftl",
    "totp.ftl",
    "applications.ftl",
    "log.ftl",
    "federatedIdentity.ftl"
] as const;

export type LoginThemePageId = (typeof LOGIN_THEME_PAGE_IDS)[number];
export type AccountThemePageId = (typeof ACCOUNT_THEME_PAGE_IDS)[number];

export const CONTAINER_NAME = "keycloak-keycloakify";

export const FALLBACK_LANGUAGE_TAG = "en";

export const LOGIN_THEME_RESOURCES_FROMkEYCLOAK_VERSION_DEFAULT = "24.0.4";
