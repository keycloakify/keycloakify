"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeycloakThemeTranslation = void 0;
var useKeycloakLanguage_1 = require("./useKeycloakLanguage");
var messages_generated_1 = require("./messages.generated");
var powerhooks_1 = require("powerhooks");
function useKeycloakThemeTranslation() {
    var keycloakLanguage = useKeycloakLanguage_1.useKeycloakLanguage().keycloakLanguage;
    var t = powerhooks_1.useConstCallback(function (key) {
        var out = messages_generated_1.messages["login"][keycloakLanguage][key];
        if (out !== undefined) {
            return out;
        }
        return messages_generated_1.messages["login"]["en"][key];
    });
    return { t: t };
}
exports.useKeycloakThemeTranslation = useKeycloakThemeTranslation;
//# sourceMappingURL=useKeycloakTranslation.js.map