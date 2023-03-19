export declare namespace keycloak_js {
    export type KeycloakPromiseCallback<T> = (result: T) => void;
    export class KeycloakPromise<TSuccess, TError> extends Promise<TSuccess> {
        success(callback: KeycloakPromiseCallback<TSuccess>): KeycloakPromise<TSuccess, TError>;
        error(callback: KeycloakPromiseCallback<TError>): KeycloakPromise<TSuccess, TError>;
    }
    export interface KeycloakAdapter {
        login(options?: KeycloakLoginOptions): KeycloakPromise<void, void>;
        logout(options?: KeycloakLogoutOptions): KeycloakPromise<void, void>;
        register(options?: KeycloakLoginOptions): KeycloakPromise<void, void>;
        accountManagement(): KeycloakPromise<void, void>;
        redirectUri(options: { redirectUri: string }, encodeHash: boolean): string;
    }
    export interface KeycloakLogoutOptions {
        redirectUri?: string;
    }
    export interface KeycloakLoginOptions {
        scope?: string;
        redirectUri?: string;
        prompt?: "none" | "login";
        action?: string;
        maxAge?: number;
        loginHint?: string;
        idpHint?: string;
        locale?: string;
        cordovaOptions?: { [optionName: string]: string };
    }

    export type KeycloakInstance = Record<
        "createLoginUrl" | "createLogoutUrl" | "createRegisterUrl",
        (options: KeycloakLoginOptions | undefined) => string
    > & {
        createAccountUrl(): string;
        redirectUri?: string;
    };
}

/**
 * NOTE: This is just a slightly modified version of the default adapter in keycloak-js
 * The goal here is just to be able to inject search param in url before keycloak redirect.
 * Our use case for it is to pass over the login screen the states of useGlobalState
 * namely isDarkModeEnabled, lgn...
 */
export function createKeycloakAdapter(params: {
    keycloakInstance: keycloak_js.KeycloakInstance;
    transformUrlBeforeRedirect: (url: string) => string;
    getRedirectMethod?: () => "overwrite location.href" | "location.replace";
}): keycloak_js.KeycloakAdapter {
    const { keycloakInstance, transformUrlBeforeRedirect, getRedirectMethod = () => "overwrite location.href" } = params;

    const neverResolvingPromise: keycloak_js.KeycloakPromise<void, void> = Object.defineProperties(new Promise(() => {}), {
        "success": { "value": () => {} },
        "error": { "value": () => {} }
    }) as any;

    return {
        "login": options => {
            const newHref = transformUrlBeforeRedirect(keycloakInstance.createLoginUrl(options));
            switch (getRedirectMethod()) {
                case "location.replace":
                    window.location.replace(newHref);
                    break;
                case "overwrite location.href":
                    window.location.href = newHref;
                    break;
            }
            return neverResolvingPromise;
        },
        "register": options => {
            const newHref = transformUrlBeforeRedirect(keycloakInstance.createRegisterUrl(options));
            switch (getRedirectMethod()) {
                case "location.replace":
                    window.location.replace(newHref);
                    break;
                case "overwrite location.href":
                    window.location.href = newHref;
                    break;
            }

            return neverResolvingPromise;
        },
        "logout": options => {
            window.location.replace(transformUrlBeforeRedirect(keycloakInstance.createLogoutUrl(options)));
            return neverResolvingPromise;
        },
        "accountManagement": () => {
            const accountUrl = transformUrlBeforeRedirect(keycloakInstance.createAccountUrl());

            if (accountUrl === "undefined") {
                throw new Error("Not supported by the OIDC server");
            }

            switch (getRedirectMethod()) {
                case "location.replace":
                    window.location.replace(accountUrl);
                    break;
                case "overwrite location.href":
                    window.location.href = accountUrl;
                    break;
            }

            return neverResolvingPromise;
        },
        "redirectUri": options => {
            if (options && options.redirectUri) {
                return options.redirectUri;
            } else if (keycloakInstance.redirectUri) {
                return keycloakInstance.redirectUri;
            } else {
                return window.location.href;
            }
        }
    };
}
