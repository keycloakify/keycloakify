"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var replaceImportFromStatic_1 = require("../../bin/build-keycloak-theme/replaceImportFromStatic");
var fixedJsCode = (0, replaceImportFromStatic_1.replaceImportsFromStaticInJsCode)({
    "jsCode": "\n        function f() {\n            return a.p+\"static/js/\" + ({}[e] || e) + \".\" + {\n                3: \"0664cdc0\"\n            }[e] + \".chunk.js\"\n        }\n\n        function f2() {\n            return a.p+\"static/js/\" + ({}[e] || e) + \".\" + {\n                3: \"0664cdc0\"\n            }[e] + \".chunk.js\"\n        }\n    ",
    "urlOrigin": undefined,
}).fixedJsCode;
var fixedJsCodeExternal = (0, replaceImportFromStatic_1.replaceImportsFromStaticInJsCode)({
    "jsCode": "\n        function f() {\n            return a.p+\"static/js/\" + ({}[e] || e) + \".\" + {\n                3: \"0664cdc0\"\n            }[e] + \".chunk.js\"\n        }\n\n        function f2() {\n            return a.p+\"static/js/\" + ({}[e] || e) + \".\" + {\n                3: \"0664cdc0\"\n            }[e] + \".chunk.js\"\n        }\n    ",
    "urlOrigin": "https://www.example.com",
}).fixedJsCode;
console.log({ fixedJsCode: fixedJsCode, fixedJsCodeExternal: fixedJsCodeExternal });
var _a = (0, replaceImportFromStatic_1.replaceImportsInCssCode)({
    "cssCode": "\n\n    .my-div {\n        background: url(/logo192.png) no-repeat center center;\n    }\n\n    .my-div2 {\n        background: url(/logo192.png) no-repeat center center;\n    }\n\n    .my-div {\n        background-image: url(/static/media/something.svg);\n    }\n    ",
}), fixedCssCode = _a.fixedCssCode, cssGlobalsToDefine = _a.cssGlobalsToDefine;
console.log({ fixedCssCode: fixedCssCode, cssGlobalsToDefine: cssGlobalsToDefine });
var cssCodeToPrependInHead = (0, replaceImportFromStatic_1.generateCssCodeToDefineGlobals)({
    cssGlobalsToDefine: cssGlobalsToDefine,
    "urlPathname": "/",
}).cssCodeToPrependInHead;
console.log({ cssCodeToPrependInHead: cssCodeToPrependInHead });
//# sourceMappingURL=replaceImportFromStatic.js.map