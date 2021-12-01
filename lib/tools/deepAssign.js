"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepAssign = void 0;
var assert_1 = require("tsafe/assert");
var is_1 = require("tsafe/is");
var deepClone_1 = require("./deepClone");
//Warning: Be mindful that because of array this is not idempotent.
function deepAssign(params) {
    var target = params.target;
    var source = (0, deepClone_1.deepClone)(params.source);
    Object.keys(source).forEach(function (key) {
        var dereferencedSource = source[key];
        if (target[key] === undefined || !(dereferencedSource instanceof Object)) {
            Object.defineProperty(target, key, {
                "enumerable": true,
                "writable": true,
                "configurable": true,
                "value": dereferencedSource,
            });
            return;
        }
        var dereferencedTarget = target[key];
        if (dereferencedSource instanceof Array) {
            (0, assert_1.assert)((0, is_1.is)(dereferencedTarget));
            (0, assert_1.assert)((0, is_1.is)(dereferencedSource));
            dereferencedSource.forEach(function (entry) { return dereferencedTarget.push(entry); });
            return;
        }
        (0, assert_1.assert)((0, is_1.is)(dereferencedTarget));
        (0, assert_1.assert)((0, is_1.is)(dereferencedSource));
        deepAssign({
            "target": dereferencedTarget,
            "source": dereferencedSource,
        });
    });
}
exports.deepAssign = deepAssign;
//# sourceMappingURL=deepAssign.js.map