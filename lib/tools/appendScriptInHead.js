"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendScriptInHead = void 0;
function appendScriptInHead(props) {
    var src = props.src;
    var script = document.createElement("script");
    Object.assign(script, {
        src: src,
        "type": "text/javascript",
    });
    document.getElementsByTagName("head")[0].appendChild(script);
}
exports.appendScriptInHead = appendScriptInHead;
//# sourceMappingURL=appendScriptInHead.js.map