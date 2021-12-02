export declare namespace keycloak_js {
    type KeycloakPromiseCallback<T> = (result: T) => void;
    class KeycloakPromise<TSuccess, TError> extends Promise<TSuccess> {
        success(callback: KeycloakPromiseCallback<TSuccess>): KeycloakPromise<TSuccess, TError>;
        error(callback: KeycloakPromiseCallback<TError>): KeycloakPromise<TSuccess, TError>;
    }
    interface KeycloakAdapter {
        login(options?: KeycloakLoginOptions): KeycloakPromise<void, void>;
        logout(options?: KeycloakLogoutOptions): KeycloakPromise<void, void>;
        register(options?: KeycloakLoginOptions): KeycloakPromise<void, void>;
        accountManagement(): KeycloakPromise<void, void>;
        redirectUri(options: {
            redirectUri: string;
        }, encodeHash: boolean): string;
    }
    interface KeycloakLogoutOptions {
        redirectUri?: string;
    }
    interface KeycloakLoginOptions {
        scope?: string;
        redirectUri?: string;
        prompt?: "none" | "login";
        action?: string;
        maxAge?: number;
        loginHint?: string;
        idpHint?: string;
        locale?: string;
        cordovaOptions?: {
            [optionName: string]: string;
        };
    }
    type KeycloakInstance = Record<"createLoginUrl" | "createLogoutUrl" | "createRegisterUrl", (options: KeycloakLoginOptions | undefined) => string> & {
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
export declare function createKeycloakAdapter(params: {
    keycloakInstance: keycloak_js.KeycloakInstance;
    transformUrlBeforeRedirect(url: string): string;
}): keycloak_js.KeycloakAdapter;
