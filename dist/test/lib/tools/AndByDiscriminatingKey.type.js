"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("tsafe/assert");
(0, assert_1.assert)();
var x = null;
if (x.pageId === "a") {
    x.onlyA;
    x.onlyExtA;
    //@ts-expect-error
    x.onlyB;
    //@ts-expect-error
    x.onlyBase;
    //@ts-expect-error
    x.onlyExt;
}
if (x.pageId === "b") {
    x.onlyB;
    x.onlyExtB;
    //@ts-expect-error
    x.onlyA;
    //@ts-expect-error
    x.onlyBase;
    //@ts-expect-error
    x.onlyExt;
}
if (x.pageId === "only base") {
    x.onlyBase;
    //@ts-expect-error
    x.onlyA;
    //@ts-expect-error
    x.onlyB;
    //@ts-expect-error
    x.onlyExt;
}
if (x.pageId === "only ext") {
    x.onlyExt;
    //@ts-expect-error
    x.onlyA;
    //@ts-expect-error
    x.onlyB;
    //@ts-expect-error
    x.onlyBase;
}
//# sourceMappingURL=AndByDiscriminatingKey.type.js.map