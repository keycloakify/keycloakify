(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.keycloak_react_theming = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myObject = exports.myFunction = void 0;
var myFunction_1 = require("./myFunction");
Object.defineProperty(exports, "myFunction", { enumerable: true, get: function () { return myFunction_1.myFunction; } });
var myObject_1 = require("./myObject");
Object.defineProperty(exports, "myObject", { enumerable: true, get: function () { return myObject_1.myObject; } });

},{"./myFunction":2,"./myObject":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myFunction = void 0;
function myFunction() {
    return Promise.resolve(["a", "b", "c"]);
}
exports.myFunction = myFunction;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myObject = void 0;
var toUpperCase_1 = require("./tools/toUpperCase");
exports.myObject = { "p": toUpperCase_1.toUpperCase("foo") };

},{"./tools/toUpperCase":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUpperCase = void 0;
function toUpperCase(str) {
    return str.toUpperCase();
}
exports.toUpperCase = toUpperCase;

},{}]},{},[1])(1)
});
//# sourceMappingURL=bundle.js.map
