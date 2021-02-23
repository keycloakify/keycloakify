"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.keycloakPagesContext = void 0;
var generateKeycloakThemeResources_1 = require("../bin/build-keycloak-theme/generateKeycloakThemeResources");
var id_1 = require("evt/tools/typeSafety/id");
exports.keycloakPagesContext = (_a = {}, _a[generateKeycloakThemeResources_1.ftlValuesGlobalName] = id_1.id(window[generateKeycloakThemeResources_1.ftlValuesGlobalName]), _a).keycloakPagesContext;
;
//# sourceMappingURL=keycloakFtlValues.js.map