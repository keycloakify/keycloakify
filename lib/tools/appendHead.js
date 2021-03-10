"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendHead = void 0;
var Deferred_1 = require("evt/tools/Deferred");
function appendHead(params) {
    var htmlElement = document.createElement((function () {
        switch (params.type) {
            case "css": return "link";
            case "javascript": return "script";
        }
    })());
    var dLoaded = new Deferred_1.Deferred();
    htmlElement.addEventListener("load", function () { return dLoaded.resolve(); });
    Object.assign(htmlElement, (function () {
        switch (params.type) {
            case "css": return {
                "href": params.href,
                "type": "text/css",
                "rel": "stylesheet",
                "media": "screen,print"
            };
            case "javascript": return {
                "src": params.src,
                "type": "text/javascript",
            };
        }
    })());
    document.getElementsByTagName("head")[0].appendChild(htmlElement);
    return dLoaded.pr;
}
exports.appendHead = appendHead;
//# sourceMappingURL=appendHead.js.map