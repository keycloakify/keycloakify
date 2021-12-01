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
Object.defineProperty(exports, "__esModule", { value: true });
exports.kcMessages = exports.evtTermsUpdated = void 0;
var login_1 = require("../generated_kcMessages/15.0.2/login");
var evt_1 = require("evt");
var objectKeys_1 = require("tsafe/objectKeys");
var kcMessages = __assign(__assign({}, login_1.kcMessages), { "en": __assign(__assign({}, login_1.kcMessages["en"]), { "shouldBeEqual": "{0} should be equal to {1}", "shouldBeDifferent": "{0} should be different to {1}", "shouldMatchPattern": "Pattern should match: `/{0}/`", "mustBeAnInteger": "Must be an integer" }), "fr": __assign(__assign({}, login_1.kcMessages["fr"]), { 
        /* spell-checker: disable */
        "shouldBeEqual": "{0} doit être egale à {1}", "shouldBeDifferent": "{0} doit être différent de {1}", "shouldMatchPattern": "Dois respecter le schéma: `/{0}/`", "mustBeAnInteger": "Doit être un nombre entiers" }) });
exports.kcMessages = kcMessages;
exports.evtTermsUpdated = evt_1.Evt.asNonPostable(evt_1.Evt.create());
["termsText", "doAccept", "doDecline", "termsTitle"].forEach(function (key) {
    return (0, objectKeys_1.objectKeys)(kcMessages).forEach(function (kcLanguage) {
        return Object.defineProperty(kcMessages[kcLanguage], key, (function () {
            var value = key === "termsText" ? "⏳" : kcMessages[kcLanguage][key];
            return {
                "enumerable": true,
                "get": function () { return value; },
                "set": function (newValue) {
                    value = newValue;
                    evt_1.Evt.asPostable(exports.evtTermsUpdated).post();
                },
            };
        })());
    });
});
//# sourceMappingURL=login.js.map