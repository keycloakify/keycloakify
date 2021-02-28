"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeycloakThemeTranslation = void 0;
var useKeycloakLanguage_1 = require("./useKeycloakLanguage");
var login_1 = require("./generated_messages/login");
var powerhooks_1 = require("powerhooks");
function useKeycloakThemeTranslation() {
    var keycloakLanguage = useKeycloakLanguage_1.useKeycloakLanguage().keycloakLanguage;
    var t = powerhooks_1.useConstCallback(function (key) {
        var out = login_1.messages[keycloakLanguage][key];
        if (out !== undefined) {
            return out;
        }
        return login_1.messages["en"][key];
    });
    return { t: t };
}
exports.useKeycloakThemeTranslation = useKeycloakThemeTranslation;
//# sourceMappingURL=useKeycloakTranslation.js.map