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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKcMessage = exports.kcMessages = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
require("minimal-polyfills/Object.fromEntries");
var react_1 = require("react");
var useKcLanguageTag_1 = require("./useKcLanguageTag");
var login_1 = require("./kcMessages/login");
Object.defineProperty(exports, "kcMessages", { enumerable: true, get: function () { return login_1.kcMessages; } });
var hooks_1 = require("evt/hooks");
//NOTE for later: https://github.com/remarkjs/react-markdown/blob/236182ecf30bd89c1e5a7652acaf8d0bf81e6170/src/renderers.js#L7-L35
var react_markdown_1 = __importDefault(require("react-markdown"));
var useGuaranteedMemo_1 = require("powerhooks/useGuaranteedMemo");
function resolveMsg(props) {
    var _a;
    var key = props.key, args = props.args, kcLanguageTag = props.kcLanguageTag, doRenderMarkdown = props.doRenderMarkdown;
    var str = (_a = login_1.kcMessages[kcLanguageTag][key]) !== null && _a !== void 0 ? _a : login_1.kcMessages["en"][key];
    if (str === undefined) {
        return undefined;
    }
    str = (function () {
        var _a;
        var startIndex = (_a = str
            .match(/{[0-9]+}/g)) === null || _a === void 0 ? void 0 : _a.map(function (g) { return g.match(/{([0-9]+)}/)[1]; }).map(function (indexStr) { return parseInt(indexStr); }).sort(function (a, b) { return a - b; })[0];
        if (startIndex === undefined) {
            return str;
        }
        args.forEach(function (arg, i) {
            if (arg === undefined) {
                return;
            }
            str = str.replace(new RegExp("\\{" + (i + startIndex) + "\\}", "g"), arg);
        });
        return str;
    })();
    return (doRenderMarkdown ? ((0, jsx_runtime_1.jsx)(react_markdown_1.default, __assign({ allowDangerousHtml: true, renderers: key === "termsText" ? undefined : { "paragraph": "span" } }, { children: str }), void 0)) : (str));
}
function resolveMsgAdvanced(props) {
    var key = props.key, args = props.args, kcLanguageTag = props.kcLanguageTag, doRenderMarkdown = props.doRenderMarkdown;
    var match = key.match(/^\$\{([^{]+)\}$/);
    var keyUnwrappedFromCurlyBraces = match === null ? key : match[1];
    var out = resolveMsg({
        "key": keyUnwrappedFromCurlyBraces,
        args: args,
        kcLanguageTag: kcLanguageTag,
        doRenderMarkdown: doRenderMarkdown,
    });
    return (out !== undefined ? out : doRenderMarkdown ? (0, jsx_runtime_1.jsx)("span", { children: keyUnwrappedFromCurlyBraces }, void 0) : keyUnwrappedFromCurlyBraces);
}
/**
 * When the language is switched the page is reloaded, this may appear
 * as a bug as you might notice that the language successfully switch before
 * reload.
 * However we need to tell Keycloak that the user have changed the language
 * during login so we can retrieve the "local" field of the JWT encoded accessToken.
 * https://user-images.githubusercontent.com/6702424/138096682-351bb61f-f24e-4caf-91b7-cca8cfa2cb58.mov
 *
 * advancedMsg("${access-denied}") === advancedMsg("access-denied") === msg("access-denied")
 * advancedMsg("${not-a-message-key}") === advancedMsg(not-a-message-key") === "not-a-message-key"
 *
 */
function useKcMessage() {
    var kcLanguageTag = (0, useKcLanguageTag_1.useKcLanguageTag)().kcLanguageTag;
    var _a = __read((0, react_1.useReducer)(function (counter) { return counter + 1; }, 0), 2), trigger = _a[0], forceUpdate = _a[1];
    (0, hooks_1.useEvt)(function (ctx) { return login_1.evtTermsUpdated.attach(ctx, forceUpdate); }, []);
    return (0, useGuaranteedMemo_1.useGuaranteedMemo)(function () { return ({
        "msgStr": function (key) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return resolveMsg({ key: key, args: args, kcLanguageTag: kcLanguageTag, "doRenderMarkdown": false });
        },
        "msg": function (key) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return resolveMsg({ key: key, args: args, kcLanguageTag: kcLanguageTag, "doRenderMarkdown": true });
        },
        "advancedMsg": function (key) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return resolveMsgAdvanced({ key: key, args: args, kcLanguageTag: kcLanguageTag, "doRenderMarkdown": true });
        },
        "advancedMsgStr": function (key) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return resolveMsgAdvanced({ key: key, args: args, kcLanguageTag: kcLanguageTag, "doRenderMarkdown": false });
        },
    }); }, [kcLanguageTag, trigger]);
}
exports.useKcMessage = useKcMessage;
//# sourceMappingURL=useKcMessage.js.map