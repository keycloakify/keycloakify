"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKcContextFromWindow = void 0;
var ftlValuesGlobalName_1 = require("../../bin/build-keycloak-theme/ftlValuesGlobalName");
function getKcContextFromWindow() {
    return typeof window === "undefined" ? undefined : window[ftlValuesGlobalName_1.ftlValuesGlobalName];
}
exports.getKcContextFromWindow = getKcContextFromWindow;
//# sourceMappingURL=getKcContextFromWindow.js.map