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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKcContext = void 0;
var kcContextMocks_1 = require("./kcContextMocks");
var deepAssign_1 = require("../tools/deepAssign");
var id_1 = require("tsafe/id");
var exclude_1 = require("tsafe/exclude");
var assert_1 = require("tsafe/assert");
var getKcContextFromWindow_1 = require("./getKcContextFromWindow");
function getKcContext(params) {
    var _a, _b;
    var _c = params !== null && params !== void 0 ? params : {}, mockPageId = _c.mockPageId, mockData = _c.mockData;
    if (mockPageId !== undefined) {
        //TODO maybe trow if no mock fo custom page
        var kcContextDefaultMock = kcContextMocks_1.kcContextMocks.find(function (_a) {
            var pageId = _a.pageId;
            return pageId === mockPageId;
        });
        var partialKcContextCustomMock = mockData === null || mockData === void 0 ? void 0 : mockData.find(function (_a) {
            var pageId = _a.pageId;
            return pageId === mockPageId;
        });
        if (kcContextDefaultMock === undefined && partialKcContextCustomMock === undefined) {
            console.warn([
                "WARNING: You declared the non build in page " + mockPageId + " but you didn't ",
                "provide mock data needed to debug the page outside of Keycloak as you are trying to do now.",
                "Please check the documentation of the getKcContext function",
            ].join("\n"));
        }
        var kcContext_1 = {};
        (0, deepAssign_1.deepAssign)({
            "target": kcContext_1,
            "source": kcContextDefaultMock !== undefined ? kcContextDefaultMock : __assign({ "pageId": mockPageId }, kcContextMocks_1.kcContextCommonMock),
        });
        if (partialKcContextCustomMock !== undefined) {
            (0, deepAssign_1.deepAssign)({
                "target": kcContext_1,
                "source": partialKcContextCustomMock,
            });
            if (partialKcContextCustomMock.pageId === "register-user-profile.ftl") {
                (0, assert_1.assert)((kcContextDefaultMock === null || kcContextDefaultMock === void 0 ? void 0 : kcContextDefaultMock.pageId) === "register-user-profile.ftl");
                var attributes = kcContextDefaultMock.profile.attributes;
                (0, id_1.id)(kcContext_1).profile.attributes = [];
                (0, id_1.id)(kcContext_1).profile.attributesByName = {};
                var partialAttributes_1 = __spreadArray([], __read(((_b = (_a = partialKcContextCustomMock.profile) === null || _a === void 0 ? void 0 : _a.attributes) !== null && _b !== void 0 ? _b : [])), false).filter((0, exclude_1.exclude)(undefined));
                attributes.forEach(function (attribute) {
                    var partialAttribute = partialAttributes_1.find(function (_a) {
                        var name = _a.name;
                        return name === attribute.name;
                    });
                    var augmentedAttribute = {};
                    (0, deepAssign_1.deepAssign)({
                        "target": augmentedAttribute,
                        "source": attribute,
                    });
                    if (partialAttribute !== undefined) {
                        partialAttributes_1.splice(partialAttributes_1.indexOf(partialAttribute), 1);
                        (0, deepAssign_1.deepAssign)({
                            "target": augmentedAttribute,
                            "source": partialAttribute,
                        });
                    }
                    (0, id_1.id)(kcContext_1).profile.attributes.push(augmentedAttribute);
                    (0, id_1.id)(kcContext_1).profile.attributesByName[augmentedAttribute.name] = augmentedAttribute;
                });
                partialAttributes_1.forEach(function (partialAttribute) {
                    var name = partialAttribute.name;
                    (0, assert_1.assert)(name !== undefined, "If you define a mock attribute it must have at least a name");
                    (0, id_1.id)(kcContext_1).profile.attributes.push(partialAttribute);
                    (0, id_1.id)(kcContext_1).profile.attributesByName[name] = partialAttribute;
                });
            }
        }
        return { kcContext: kcContext_1 };
    }
    return { "kcContext": (0, getKcContextFromWindow_1.getKcContextFromWindow)() };
}
exports.getKcContext = getKcContext;
//# sourceMappingURL=getKcContext.js.map