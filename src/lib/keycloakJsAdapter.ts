

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
        redirectUri(options: { redirectUri: string; }, encodeHash: boolean): string;
    }
    export interface KeycloakLogoutOptions {
        redirectUri?: string;
    }
    export interface KeycloakLoginOptions {
        scope?: string;
        redirectUri?: string;
        prompt?: 'none' | 'login';
        action?: string;
        maxAge?: number;
        loginHint?: string;
        idpHint?: string;
        locale?: string;
        cordovaOptions?: { [optionName: string]: string };
    }

    export type KeycloakInstance = Record<
        "createLoginUrl" |
        "createLogoutUrl" |
        "createRegisterUrl",
        (options: KeycloakLoginOptions | undefined) => string
    > & {
        createAccountUrl(): string;
        redirectUri?: string;
    }

}

/**
* NOTE: This is just a slightly modified version of the default adapter in keycloak-js
* The goal here is just to be able to inject search param in url before keycloak redirect.
* Our use case for it is to pass over the login screen the states of useGlobalState
* namely isDarkModeEnabled, lgn... 
*/
export function createKeycloakAdapter(
    params: {
        keycloakInstance: keycloak_js.KeycloakInstance;
        transformUrlBeforeRedirect(url: string): string;
    }
): keycloak_js.KeycloakAdapter {

    const { keycloakInstance, transformUrlBeforeRedirect } = params;

    const neverResolvingPromise: keycloak_js.KeycloakPromise<void, void> = Object.defineProperties(
        new Promise(() => { }),
        {
            "success": { "value": () => { } },
            "error": { "value": () => { } }
        }
    );

    return {
        "login": options => {
            window.location.href= 
                transformUrlBeforeRedirect(
                    keycloakInstance.createLoginUrl(
                        options
                    )
                );
            return neverResolvingPromise;
        },
        "logout": options => {
            window.location.replace(
                transformUrlBeforeRedirect(
                    keycloakInstance.createLogoutUrl(
                        options
                    )
                )
            );
            return neverResolvingPromise;
        },
        "register": options => {
            window.location.href =
                transformUrlBeforeRedirect(
                    keycloakInstance.createRegisterUrl(
                        options
                    )
                );

            return neverResolvingPromise;
        },
        "accountManagement": () => {
            var accountUrl = transformUrlBeforeRedirect(keycloakInstance.createAccountUrl());
            if (typeof accountUrl !== 'undefined') {
                window.location.href = accountUrl;
            } else {
                throw new Error("Not supported by the OIDC server");
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