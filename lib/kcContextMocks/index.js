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
Object.defineProperty(exports, "__esModule", { value: true });
exports.kcLoginVerifyEmailContext = exports.kcLoginResetPasswordContext = exports.kcErrorContext = exports.kcInfoContext = exports.kcRegisterContext = exports.kcLoginContext = exports.kcTemplateContext = void 0;
var useKcLanguageTag_1 = require("../i18n/useKcLanguageTag");
var KcLanguageTag_1 = require("../i18n/KcLanguageTag");
//NOTE: Aside because we want to be able to import them from node
var urlResourcesPath_1 = require("./urlResourcesPath");
exports.kcTemplateContext = {
    "url": {
        "loginAction": "#",
        "resourcesPath": "/" + urlResourcesPath_1.resourcesPath,
        "resourcesCommonPath": "/" + urlResourcesPath_1.resourcesCommonPath,
        "loginRestartFlowUrl": "/auth/realms/myrealm/login-actions/restart?client_id=account&tab_id=HoAx28ja4xg",
        "loginUrl": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg",
    },
    "realm": {
        "displayName": "myrealm",
        "displayNameHtml": "myrealm",
        "internationalizationEnabled": true,
        "registrationEmailAsUsername": true,
    },
    "locale": {
        "supported": [
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=de",
                "languageTag": "de"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=no",
                "languageTag": "no"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ru",
                "languageTag": "ru"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=sv",
                "languageTag": "sv"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=pt-BR",
                "languageTag": "pt-BR"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=lt",
                "languageTag": "lt"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=en",
                "languageTag": "en"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=it",
                "languageTag": "it"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=fr",
                "languageTag": "fr"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=zh-CN",
                "languageTag": "zh-CN"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=es",
                "languageTag": "es"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=cs",
                "languageTag": "cs"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ja",
                "languageTag": "ja"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=sk",
                "languageTag": "sk"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=pl",
                "languageTag": "pl"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ca",
                "languageTag": "ca"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=nl",
                "languageTag": "nl"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=tr",
                "languageTag": "tr"
            }
        ],
        "current": null
    },
    "auth": {
        "showUsername": false,
        "showResetCredentials": false,
        "showTryAnotherWayLink": false
    },
    "scripts": [],
    "message": {
        "type": "success",
        "summary": "This is a test message"
    },
    "isAppInitiatedAction": false,
};
Object.defineProperty(exports.kcTemplateContext.locale, "current", {
    "get": function () { return KcLanguageTag_1.getKcLanguageTagLabel(useKcLanguageTag_1.getEvtKcLanguage().state); },
    "enumerable": true
});
exports.kcLoginContext = __assign(__assign({}, exports.kcTemplateContext), { "pageId": "login.ftl", "url": __assign(__assign({}, exports.kcTemplateContext.url), { "loginResetCredentialsUrl": "/auth/realms/myrealm/login-actions/reset-credentials?client_id=account&tab_id=HoAx28ja4xg", "registrationUrl": "/auth/realms/myrealm/login-actions/registration?client_id=account&tab_id=HoAx28ja4xg" }), "realm": __assign(__assign({}, exports.kcTemplateContext.realm), { "loginWithEmailAllowed": true, "rememberMe": true, "password": true, "resetPasswordAllowed": true, "registrationAllowed": true }), "auth": exports.kcTemplateContext.auth, "social": {
        "displayInfo": true
    }, "usernameEditDisabled": false, "login": {
        "rememberMe": false
    }, "registrationDisabled": false });
exports.kcRegisterContext = __assign(__assign({}, exports.kcTemplateContext), { "url": __assign(__assign({}, exports.kcLoginContext.url), { "registrationAction": "http://localhost:8080/auth/realms/myrealm/login-actions/registration?session_code=gwZdUeO7pbYpFTRxiIxRg_QtzMbtFTKrNu6XW_f8asM&execution=12146ce0-b139-4bbd-b25b-0eccfee6577e&client_id=account&tab_id=uS8lYfebLa0" }), "messagesPerField": {
        "printIfExists": function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var _b = __read(_a, 2), x = _b[1];
            return x;
        }
    }, "scripts": [], "isAppInitiatedAction": false, "pageId": "register.ftl", "register": {
        "formData": {}
    }, "passwordRequired": true, "recaptchaRequired": false });
exports.kcInfoContext = __assign(__assign({}, exports.kcTemplateContext), { "pageId": "info.ftl", "messageHeader": "<Message header>", "requiredActions": undefined, "skipLink": false, "actionUri": "#", "client": {
        "baseUrl": "#"
    } });
exports.kcErrorContext = __assign(__assign({}, exports.kcTemplateContext), { "pageId": "error.ftl", "client": {
        "baseUrl": "#"
    } });
exports.kcLoginResetPasswordContext = __assign(__assign({}, exports.kcTemplateContext), { "pageId": "login-reset-password.ftl", "realm": __assign(__assign({}, exports.kcTemplateContext.realm), { "loginWithEmailAllowed": false }) });
exports.kcLoginVerifyEmailContext = __assign(__assign({}, exports.kcTemplateContext), { "pageId": "login-verify-email.ftl" });
//# sourceMappingURL=index.js.map