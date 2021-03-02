"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KcApp = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var kcContext_1 = require("../kcContext");
var assert_1 = require("evt/tools/typeSafety/assert");
var Login_1 = require("./Login");
exports.KcApp = react_1.memo(function (props) {
    var kcProperties = props.kcProperties;
    assert_1.assert(kcContext_1.kcContext !== undefined, "App is not currently served by a Keycloak server");
    switch (kcContext_1.kcContext.pageBasename) {
        case "login.ftl": return jsx_runtime_1.jsx(Login_1.Login, { kcProperties: kcProperties }, void 0);
        case "register.ftl":
            alert("TODO: Implement " + kcContext_1.kcContext.pageBasename);
            return null;
    }
});
//# sourceMappingURL=KcApp.js.map