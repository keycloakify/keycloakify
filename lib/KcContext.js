"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kcContext = void 0;
var ftlValuesGlobalName_1 = require("../bin/build-keycloak-theme/ftlValuesGlobalName");
var id_1 = require("evt/tools/typeSafety/id");
var doExtends_1 = require("evt/tools/typeSafety/doExtends");
doExtends_1.doExtends();
doExtends_1.doExtends();
exports.kcContext = id_1.id(window[ftlValuesGlobalName_1.ftlValuesGlobalName]);
//# sourceMappingURL=KcContext.js.map