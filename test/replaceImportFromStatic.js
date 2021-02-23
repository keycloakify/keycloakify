"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var replaceImportFromStatic_1 = require("../bin/build-keycloak-theme/replaceImportFromStatic");
var fixedJsCode = replaceImportFromStatic_1.replaceImportFromStaticInJsCode({
    "ftlValuesGlobalName": "keycloakFtlValues",
    "jsCode": "\n        function f() {\n            return a.p + \"static/js/\" + ({}[e] || e) + \".\" + {\n                3: \"0664cdc0\"\n            }[e] + \".chunk.js\"\n        }\n\n        function f2() {\n            return a.p +\"static/js/\" + ({}[e] || e) + \".\" + {\n                3: \"0664cdc0\"\n            }[e] + \".chunk.js\"\n        }\n    "
}).fixedJsCode;
console.log({ fixedJsCode: fixedJsCode });
var _a = replaceImportFromStatic_1.replaceImportFromStaticInCssCode({
    "cssCode": "\n\n    .my-div {\n        background: url(/logo192.png) no-repeat center center;\n    }\n\n    .my-div2 {\n        background: url(/logo192.png) no-repeat center center;\n    }\n\n    .my-div {\n        background-image: url(/static/media/something.svg);\n    }\n    "
}), fixedCssCode = _a.fixedCssCode, cssGlobalsToDefine = _a.cssGlobalsToDefine;
console.log({ fixedCssCode: fixedCssCode, cssGlobalsToDefine: cssGlobalsToDefine });
var cssCodeToPrependInHead = replaceImportFromStatic_1.generateCssCodeToDefineGlobals({ cssGlobalsToDefine: cssGlobalsToDefine }).cssCodeToPrependInHead;
console.log({ cssCodeToPrependInHead: cssCodeToPrependInHead });
//# sourceMappingURL=replaceImportFromStatic.js.map