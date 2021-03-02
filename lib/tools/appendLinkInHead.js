"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendLinkInHead = void 0;
function appendLinkInHead(props) {
    var href = props.href;
    var link = document.createElement("link");
    Object.assign(link, {
        href: href,
        "type": "text/css",
        "rel": "stylesheet",
        "media": "screen,print"
    });
    document.getElementsByTagName("head")[0].appendChild(link);
}
exports.appendLinkInHead = appendLinkInHead;
//# sourceMappingURL=appendLinkInHead.js.map