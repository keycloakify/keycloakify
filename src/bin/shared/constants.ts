export const nameOfTheGlobal = "kcContext";
export const keycloak_resources = "keycloak-resources";
export const resources_common = "resources-common";
export const lastKeycloakVersionWithAccountV1 = "21.1.2";
export const basenameOfTheKeycloakifyResourcesDir = "build";

export const themeTypes = ["login", "account"] as const;
export const accountV1ThemeName = "account-v1";

export type ThemeType = (typeof themeTypes)[number];

export const vitePluginSubScriptEnvNames = {
    "runPostBuildScript": "KEYCLOAKIFY_RUN_POST_BUILD_SCRIPT",
    "resolveViteConfig": "KEYCLOAKIFY_RESOLVE_VITE_CONFIG"
} as const;

export const skipBuildJarsEnvName = "KEYCLOAKIFY_SKIP_BUILD_JAR";

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

export const containerName = "keycloak-keycloakify";
