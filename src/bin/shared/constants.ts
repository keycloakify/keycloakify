export const WELL_KNOWN_DIRECTORY_BASE_NAME = {
    KEYCLOAKIFY_DEV_RESOURCES: "keycloakify-dev-resources",
    RESOURCES_COMMON: "resources-common",
    DIST: "dist"
} as const;

export const THEME_TYPES = ["login", "account", "admin"] as const;

export type ThemeType = (typeof THEME_TYPES)[number];

export const VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES = {
    RUN_POST_BUILD_SCRIPT: "KEYCLOAKIFY_RUN_POST_BUILD_SCRIPT",
    RESOLVE_VITE_CONFIG: "KEYCLOAKIFY_RESOLVE_VITE_CONFIG",
    READ_KC_CONTEXT_FROM_URL: "KEYCLOAKIFY_READ_KC_CONTEXT_FROM_URL"
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
    "webauthn-error.ftl",
    "login-passkeys-conditional-authenticate.ftl",
    "login-idp-link-confirm-override.ftl"
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

export const CUSTOM_HANDLER_ENV_NAMES = {
    COMMAND_NAME: "KEYCLOAKIFY_COMMAND_NAME",
    BUILD_CONTEXT: "KEYCLOAKIFY_BUILD_CONTEXT"
};

export const KEYCLOAK_THEME = "keycloak-theme";

export const KEYCLOAKIFY_SPA_DEV_SERVER_PORT = "KEYCLOAKIFY_SPA_DEV_SERVER_PORT";

export const KEYCLOAKIFY_LOGGING_VERSION = "1.0.3";

export const KEYCLOAKIFY_LOGIN_JAR_BASENAME = `keycloakify-logging-${KEYCLOAKIFY_LOGGING_VERSION}.jar`;

export const TEST_APP_URL = "https://my-theme.keycloakify.dev";
