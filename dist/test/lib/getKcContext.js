"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getKcContext_1 = require("../../lib/getKcContext");
var inDepth_1 = require("evt/tools/inDepth");
var assert_1 = require("tsafe/assert");
var kcContextMocks_1 = require("../../lib/getKcContext/kcContextMocks");
var deepClone_1 = require("../../lib/tools/deepClone");
{
    var authorizedMailDomains_1 = ["example.com", "another-example.com", "*.yet-another-example.com", "*.example.com", "hello-world.com"];
    var displayName_1 = "this is an overwritten common value";
    var aNonStandardValue1_1 = "a non standard value 1";
    var aNonStandardValue2_1 = "a non standard value 2";
    var getKcContextProxy = function (params) {
        var mockPageId = params.mockPageId;
        var kcContext = (0, getKcContext_1.getKcContext)({
            mockPageId: mockPageId,
            "mockData": [
                {
                    "pageId": "login.ftl",
                    "realm": { displayName: displayName_1 },
                },
                {
                    "pageId": "info.ftl",
                    aNonStandardValue1: aNonStandardValue1_1,
                },
                {
                    "pageId": "register.ftl",
                    authorizedMailDomains: authorizedMailDomains_1,
                },
                {
                    "pageId": "my-extra-page-2.ftl",
                    aNonStandardValue2: aNonStandardValue2_1,
                },
            ],
        }).kcContext;
        return { kcContext: kcContext };
    };
    {
        var pageId_1 = "login.ftl";
        var kcContext = getKcContextProxy({ "mockPageId": pageId_1 }).kcContext;
        (0, assert_1.assert)((kcContext === null || kcContext === void 0 ? void 0 : kcContext.pageId) === pageId_1);
        (0, assert_1.assert)();
        (0, assert_1.assert)((0, inDepth_1.same)(
        //NOTE: deepClone for printIfExists or other functions...
        (0, deepClone_1.deepClone)(kcContext), (function () {
            var mock = (0, deepClone_1.deepClone)(kcContextMocks_1.kcContextMocks.find(function (_a) {
                var pageId_i = _a.pageId;
                return pageId_i === pageId_1;
            }));
            mock.realm.displayName = displayName_1;
            return mock;
        })()));
        console.log("PASS " + pageId_1);
    }
    {
        var pageId_2 = "info.ftl";
        var kcContext = getKcContextProxy({ "mockPageId": pageId_2 }).kcContext;
        (0, assert_1.assert)((kcContext === null || kcContext === void 0 ? void 0 : kcContext.pageId) === pageId_2);
        //NOTE: I don't understand the need to add: pageId: typeof pageId; ...
        (0, assert_1.assert)();
        (0, assert_1.assert)((0, inDepth_1.same)((0, deepClone_1.deepClone)(kcContext), (function () {
            var mock = (0, deepClone_1.deepClone)(kcContextMocks_1.kcContextMocks.find(function (_a) {
                var pageId_i = _a.pageId;
                return pageId_i === pageId_2;
            }));
            Object.assign(mock, { aNonStandardValue1: aNonStandardValue1_1 });
            return mock;
        })()));
        console.log("PASS " + pageId_2);
    }
    {
        var pageId_3 = "register.ftl";
        var kcContext = getKcContextProxy({ "mockPageId": pageId_3 }).kcContext;
        (0, assert_1.assert)((kcContext === null || kcContext === void 0 ? void 0 : kcContext.pageId) === pageId_3);
        //NOTE: I don't understand the need to add: pageId: typeof pageId; ...
        (0, assert_1.assert)();
        (0, assert_1.assert)((0, inDepth_1.same)((0, deepClone_1.deepClone)(kcContext), (function () {
            var mock = (0, deepClone_1.deepClone)(kcContextMocks_1.kcContextMocks.find(function (_a) {
                var pageId_i = _a.pageId;
                return pageId_i === pageId_3;
            }));
            Object.assign(mock, { authorizedMailDomains: authorizedMailDomains_1 });
            return mock;
        })()));
        console.log("PASS " + pageId_3);
    }
    {
        var pageId_4 = "my-extra-page-2.ftl";
        var kcContext = getKcContextProxy({ "mockPageId": pageId_4 }).kcContext;
        (0, assert_1.assert)((kcContext === null || kcContext === void 0 ? void 0 : kcContext.pageId) === pageId_4);
        (0, assert_1.assert)();
        kcContext.aNonStandardValue2;
        (0, assert_1.assert)((0, inDepth_1.same)((0, deepClone_1.deepClone)(kcContext), (function () {
            var mock = (0, deepClone_1.deepClone)(kcContextMocks_1.kcContextCommonMock);
            Object.assign(mock, { pageId: pageId_4, aNonStandardValue2: aNonStandardValue2_1 });
            return mock;
        })()));
        console.log("PASS " + pageId_4);
    }
    {
        var pageId_5 = "my-extra-page-1.ftl";
        console.log("We expect a warning here =>");
        var kcContext = getKcContextProxy({ "mockPageId": pageId_5 }).kcContext;
        (0, assert_1.assert)((kcContext === null || kcContext === void 0 ? void 0 : kcContext.pageId) === pageId_5);
        (0, assert_1.assert)();
        (0, assert_1.assert)((0, inDepth_1.same)((0, deepClone_1.deepClone)(kcContext), (function () {
            var mock = (0, deepClone_1.deepClone)(kcContextMocks_1.kcContextCommonMock);
            Object.assign(mock, { pageId: pageId_5 });
            return mock;
        })()));
        console.log("PASS " + pageId_5);
    }
}
{
    var pageId_6 = "login.ftl";
    var kcContext = (0, getKcContext_1.getKcContext)({
        "mockPageId": pageId_6,
    }).kcContext;
    (0, assert_1.assert)();
    (0, assert_1.assert)((0, inDepth_1.same)((0, deepClone_1.deepClone)(kcContext), (0, deepClone_1.deepClone)(kcContextMocks_1.kcContextMocks.find(function (_a) {
        var pageId_i = _a.pageId;
        return pageId_i === pageId_6;
    }))));
    console.log("PASS no extension");
}
{
    var kcContext = (0, getKcContext_1.getKcContext)().kcContext;
    (0, assert_1.assert)();
    (0, assert_1.assert)(kcContext === undefined);
    console.log("PASS no extension, no mock");
}
//# sourceMappingURL=getKcContext.js.map