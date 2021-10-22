if (!HTMLElement.prototype.prepend) {
    HTMLElement.prototype.prepend = function (childNode) {
        if (typeof childNode === "string") {
            throw new Error("Error with HTMLElement.prototype.appendFirst polyfill");
        }

        this.insertBefore(childNode, this.firstChild);
    };
}
