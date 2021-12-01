"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.kcContextMocks = exports.kcContextCommonMock = void 0;
require("minimal-polyfills/Object.fromEntries");
var useKcLanguageTag_1 = require("../../i18n/useKcLanguageTag");
var KcLanguageTag_1 = require("../../i18n/KcLanguageTag");
//NOTE: Aside because we want to be able to import them from node
var urlResourcesPath_1 = require("./urlResourcesPath");
var id_1 = require("tsafe/id");
var path_1 = require("path");
var PUBLIC_URL = (_a = process.env["PUBLIC_URL"]) !== null && _a !== void 0 ? _a : "/";
exports.kcContextCommonMock = {
    "url": {
        "loginAction": "#",
        "resourcesPath": (0, path_1.join)(PUBLIC_URL, urlResourcesPath_1.resourcesPath),
        "resourcesCommonPath": (0, path_1.join)(PUBLIC_URL, urlResourcesPath_1.resourcesCommonPath),
        "loginRestartFlowUrl": "/auth/realms/myrealm/login-actions/restart?client_id=account&tab_id=HoAx28ja4xg",
        "loginUrl": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg",
    },
    "realm": {
        "displayName": "myrealm",
        "displayNameHtml": "myrealm",
        "internationalizationEnabled": true,
        "registrationEmailAsUsername": false,
    },
    "messagesPerField": {
        "printIfExists": function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var _b = __read(_a, 2), x = _b[1];
            return x;
        },
        "existsError": function () { return true; },
        "get": function (key) { return "Fake error for " + key; },
        "exists": function () { return true; },
    },
    "locale": {
        "supported": [
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=de",
                "languageTag": "de",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=no",
                "languageTag": "no",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ru",
                "languageTag": "ru",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=sv",
                "languageTag": "sv",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=pt-BR",
                "languageTag": "pt-BR",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=lt",
                "languageTag": "lt",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=en",
                "languageTag": "en",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=it",
                "languageTag": "it",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=fr",
                "languageTag": "fr",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=zh-CN",
                "languageTag": "zh-CN",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=es",
                "languageTag": "es",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=cs",
                "languageTag": "cs",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ja",
                "languageTag": "ja",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=sk",
                "languageTag": "sk",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=pl",
                "languageTag": "pl",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ca",
                "languageTag": "ca",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=nl",
                "languageTag": "nl",
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=tr",
                "languageTag": "tr",
            },
        ],
        //"current": null as any
        "current": "English",
    },
    "auth": {
        "showUsername": false,
        "showResetCredentials": false,
        "showTryAnotherWayLink": false,
    },
    "client": {
        "clientId": "myApp",
    },
    "scripts": [],
    "message": {
        "type": "success",
        "summary": "This is a test message",
    },
    "isAppInitiatedAction": false,
};
Object.defineProperty(exports.kcContextCommonMock.locale, "current", {
    "get": function () { return (0, KcLanguageTag_1.getKcLanguageTagLabel)((0, useKcLanguageTag_1.getEvtKcLanguage)().state); },
    "enumerable": true,
});
var loginUrl = __assign(__assign({}, exports.kcContextCommonMock.url), { "loginResetCredentialsUrl": "/auth/realms/myrealm/login-actions/reset-credentials?client_id=account&tab_id=HoAx28ja4xg", "registrationUrl": "/auth/realms/myrealm/login-actions/registration?client_id=account&tab_id=HoAx28ja4xg" });
exports.kcContextMocks = __spreadArray(__spreadArray([
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "login.ftl", "url": loginUrl, "realm": __assign(__assign({}, exports.kcContextCommonMock.realm), { "loginWithEmailAllowed": true, "rememberMe": true, "password": true, "resetPasswordAllowed": true, "registrationAllowed": true }), "auth": exports.kcContextCommonMock.auth, "social": {
            "displayInfo": true,
        }, "usernameEditDisabled": false, "login": {
            "rememberMe": false,
        }, "registrationDisabled": false }))
], __read((function () {
    var registerCommon = __assign(__assign({}, exports.kcContextCommonMock), { "url": __assign(__assign({}, loginUrl), { "registrationAction": "http://localhost:8080/auth/realms/myrealm/login-actions/registration?session_code=gwZdUeO7pbYpFTRxiIxRg_QtzMbtFTKrNu6XW_f8asM&execution=12146ce0-b139-4bbd-b25b-0eccfee6577e&client_id=account&tab_id=uS8lYfebLa0" }), "scripts": [], "isAppInitiatedAction": false, "passwordRequired": true, "recaptchaRequired": false, "social": {
            "displayInfo": true,
        } });
    return [
        (0, id_1.id)(__assign(__assign({ "pageId": "register.ftl" }, registerCommon), { "register": {
                "formData": {},
            } })),
        (0, id_1.id)(__assign(__assign({ "pageId": "register-user-profile.ftl" }, registerCommon), { "profile": __assign({ "context": "REGISTRATION_PROFILE" }, (function () {
                var attributes = [
                    {
                        "validators": {
                            "username-prohibited-characters": {
                                "ignore.empty.value": true,
                            },
                            "up-username-has-value": {},
                            "length": {
                                "ignore.empty.value": true,
                                "min": "3",
                                "max": "255",
                            },
                            "up-duplicate-username": {},
                            "up-username-mutation": {},
                        },
                        "displayName": "${username}",
                        "annotations": {},
                        "required": true,
                        "groupAnnotations": {},
                        "autocomplete": "username",
                        "readOnly": false,
                        "name": "username",
                        "value": "xxxx",
                    },
                    {
                        "validators": {
                            "up-email-exists-as-username": {},
                            "length": {
                                "max": "255",
                                "ignore.empty.value": true,
                            },
                            "up-blank-attribute-value": {
                                "error-message": "missingEmailMessage",
                                "fail-on-null": false,
                            },
                            "up-duplicate-email": {},
                            "email": {
                                "ignore.empty.value": true,
                            },
                            "pattern": {
                                "ignore.empty.value": true,
                                "pattern": "gmail\\.com$",
                            },
                        },
                        "displayName": "${email}",
                        "annotations": {},
                        "required": true,
                        "groupAnnotations": {},
                        "autocomplete": "email",
                        "readOnly": false,
                        "name": "email",
                    },
                    {
                        "validators": {
                            "length": {
                                "max": "255",
                                "ignore.empty.value": true,
                            },
                            "person-name-prohibited-characters": {
                                "ignore.empty.value": true,
                            },
                            "up-immutable-attribute": {},
                            "up-attribute-required-by-metadata-value": {},
                        },
                        "displayName": "${firstName}",
                        "annotations": {},
                        "required": true,
                        "groupAnnotations": {},
                        "readOnly": false,
                        "name": "firstName",
                    },
                    {
                        "validators": {
                            "length": {
                                "max": "255",
                                "ignore.empty.value": true,
                            },
                            "person-name-prohibited-characters": {
                                "ignore.empty.value": true,
                            },
                            "up-immutable-attribute": {},
                            "up-attribute-required-by-metadata-value": {},
                        },
                        "displayName": "${lastName}",
                        "annotations": {},
                        "required": true,
                        "groupAnnotations": {},
                        "readOnly": false,
                        "name": "lastName",
                    },
                ];
                return {
                    attributes: attributes,
                    "attributesByName": Object.fromEntries(attributes.map(function (attribute) { return [attribute.name, attribute]; })),
                };
            })()) })),
    ];
})()), false), [
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "info.ftl", "messageHeader": "<Message header>", "requiredActions": undefined, "skipLink": false, "actionUri": "#", "client": {
            "clientId": "myApp",
            "baseUrl": "#",
        } })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "error.ftl", "client": {
            "clientId": "myApp",
            "baseUrl": "#",
        }, "message": {
            "type": "error",
            "summary": "This is the error message",
        } })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "login-reset-password.ftl", "realm": __assign(__assign({}, exports.kcContextCommonMock.realm), { "loginWithEmailAllowed": false }) })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "login-verify-email.ftl" })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "terms.ftl" })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "login-otp.ftl", "otpLogin": {
            "userOtpCredentials": [
                {
                    "id": "id1",
                    "userLabel": "label1",
                },
                {
                    "id": "id2",
                    "userLabel": "label2",
                },
            ],
        } })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "login-update-profile.ftl", "user": {
            "editUsernameAllowed": true,
            "username": "anUsername",
            "email": "foo@example.com",
            "firstName": "aFirstName",
            "lastName": "aLastName",
        } })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { "pageId": "login-idp-link-confirm.ftl", "idpAlias": "FranceConnect" })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { pageId: "login-config-totp.ftl", totp: {
            policy: {
                supportedApplications: ["FreeOTP", "Google Authenticator"],
                type: "totp",
                getAlgorithmKey: function () { return "SHA1"; },
                digits: 6,
                period: 30,
            },
            totpSecretEncoded: "IVQW U5TV KZ3H CULV J5TF I4TM N5FE USKC",
            qrUrl: "qrUrl",
            manualUrl: "manualUrl",
            totpSecretQrCode: "iVBORw0KGgoAAAANSUhEUgAAAPYAAAD2AQAAAADNaUdlAAACl0lEQVR4Xu2YO46DQBBE2yIg5AjcxFwMCSQuZt+EIxASIPdW1fBfaZMNegJ3YMO8CXr6z5j/KYvdV67y5feVq3z5feUq5JOZPaZitAZPM17M3wCQLg/eub/xM3OTnsyqpRbIgrdWchUIOj+tG+dmamucKSdueqr9U/V1+bLcuA9O/9fzs1psfviSEZdpW6Le5P/y9Ts+Arnyp61Lbtp/7vkVx3ehkWfGp5AkBz4VbnC40b5QHavIHyTRfr5gDq21CVbF6rNyVErvcYZqPV88h/6OqmhW07TidbnFZzin0MgN6jf83zJcUcSfm/7hfEyhyf63IhVxz4PD6+XHmNXc+6qGEX+9oYgn+4ZzlMYHVWdA+sdgZJQjYxLlwZk1oP4iUv7gFZ3wOF8sR9Y8kDB0OIcw+b9w7syC+wCFK3LOX/L/W/3Z8+DwtUyLINX8gO1KoiM+grkZ84ebZGl0mob6H/YP5h2zukfpppGpupr0KX5jOYQFUV2ZLwM64bn+RHPadx0IYV/1l4b73if/h3JN/dJ64ElS/2OTXv0fzNn6bCuNPImxUysIsuDMb3QVGXTkSTAabpNiDhz6I7U5sCKh00kazv9b/YnmrNrUHwum0mMwra4bMuEKSKLUCdP8j79cOGYF50Ct+YtVEU9LunPIgUNQutWkB04NvXH+usz/0dw5sKr/pasFfp8c+R/MJ46GUJ0Bme63kER2yp9gLuGQLc75S6qjUnoWHPpzfk1FUv0F+p/8H8671IuRMAU/klvGJ+dDX/WP5rofREFkaKaPAMk+H+bA2aSbNEn0HHLYro/+nAsvWB/RbiBsgpnwjv7n/RGCNMUnTsImmAm31P+MH8npkouW3r8/o/lf8uX3lat8+X3lKv/mP4J1WzUXYydCAAAAAElFTkSuQmCC",
            otpCredentials: [{}],
            totpSecret: "CgST5CI4i2d9VdDUmv4H",
        }, message: {
            summary: "Вам необходимо настроить аутентификатор в мобильном устройстве, чтобы активировать учетную запись.",
            type: "warning",
        }, isAppInitiatedAction: true })),
    (0, id_1.id)(__assign(__assign({}, exports.kcContextCommonMock), { pageId: "saml-post-form.ftl", samlPost: {
            url: "http://test",
            SAMLRequest: "123",
        } })),
], false);
//# sourceMappingURL=kcContextMocks.js.map