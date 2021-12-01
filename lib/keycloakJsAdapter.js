"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeycloakAdapter = void 0;
/**
 * NOTE: This is just a slightly modified version of the default adapter in keycloak-js
 * The goal here is just to be able to inject search param in url before keycloak redirect.
 * Our use case for it is to pass over the login screen the states of useGlobalState
 * namely isDarkModeEnabled, lgn...
 */
function createKeycloakAdapter(params) {
    var keycloakInstance = params.keycloakInstance, transformUrlBeforeRedirect = params.transformUrlBeforeRedirect;
    var neverResolvingPromise = Object.defineProperties(new Promise(function () { }), {
        "success": { "value": function () { } },
        "error": { "value": function () { } },
    });
    return {
        "login": function (options) {
            window.location.href = transformUrlBeforeRedirect(keycloakInstance.createLoginUrl(options));
            return neverResolvingPromise;
        },
        "logout": function (options) {
            window.location.replace(transformUrlBeforeRedirect(keycloakInstance.createLogoutUrl(options)));
            return neverResolvingPromise;
        },
        "register": function (options) {
            window.location.href = transformUrlBeforeRedirect(keycloakInstance.createRegisterUrl(options));
            return neverResolvingPromise;
        },
        "accountManagement": function () {
            var accountUrl = transformUrlBeforeRedirect(keycloakInstance.createAccountUrl());
            if (typeof accountUrl !== "undefined") {
                window.location.href = accountUrl;
            }
            else {
                throw new Error("Not supported by the OIDC server");
            }
            return neverResolvingPromise;
        },
        "redirectUri": function (options) {
            if (options && options.redirectUri) {
                return options.redirectUri;
            }
            else if (keycloakInstance.redirectUri) {
                return keycloakInstance.redirectUri;
            }
            else {
                return window.location.href;
            }
        },
    };
}
exports.createKeycloakAdapter = createKeycloakAdapter;
//# sourceMappingURL=keycloakJsAdapter.js.map