"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headInsert = void 0;
require("./HTMLElement.prototype.prepend");
var Deferred_1 = require("evt/tools/Deferred");
function headInsert(params) {
    var htmlElement = document.createElement((function () {
        switch (params.type) {
            case "css":
                return "link";
            case "javascript":
                return "script";
        }
    })());
    var dLoaded = new Deferred_1.Deferred();
    htmlElement.addEventListener("load", function () { return dLoaded.resolve(); });
    Object.assign(htmlElement, (function () {
        switch (params.type) {
            case "css":
                return {
                    "href": params.href,
                    "type": "text/css",
                    "rel": "stylesheet",
                    "media": "screen,print",
                };
            case "javascript":
                return {
                    "src": params.src,
                    "type": "text/javascript",
                };
        }
    })());
    document.getElementsByTagName("head")[0][(function () {
        switch (params.type) {
            case "javascript":
                return "appendChild";
            case "css":
                return (function () {
                    switch (params.position) {
                        case "append":
                            return "appendChild";
                        case "prepend":
                            return "prepend";
                    }
                })();
        }
    })()](htmlElement);
    return dLoaded.pr;
}
exports.headInsert = headInsert;
//# sourceMappingURL=headInsert.js.map