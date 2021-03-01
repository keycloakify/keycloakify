"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeycloakThemeTranslation = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var useKeycloakLanguage_1 = require("./useKeycloakLanguage");
var login_1 = require("./generated_messages/login");
var powerhooks_1 = require("powerhooks");
function useKeycloakThemeTranslation() {
    var keycloakLanguage = useKeycloakLanguage_1.useKeycloakLanguage().keycloakLanguage;
    var t = powerhooks_1.useConstCallback(function (key) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var out = (_a = login_1.messages[keycloakLanguage][key]) !== null && _a !== void 0 ? _a : login_1.messages["en"][key];
        args.forEach(function (arg, i) {
            if (arg === undefined) {
                return;
            }
            out = out.replace(new RegExp("\\{" + i + "\\}", "g"), arg);
        });
        return jsx_runtime_1.jsx("span", { className: key, dangerouslySetInnerHTML: { "__html": out } }, void 0);
    });
    return { t: t };
}
exports.useKeycloakThemeTranslation = useKeycloakThemeTranslation;
//# sourceMappingURL=useKeycloakTranslation.js.map