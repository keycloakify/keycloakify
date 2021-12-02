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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var child_process_1 = require("child_process");
var path_1 = require("path");
var fs = __importStar(require("fs"));
var keycloakifyDirPath = (0, path_1.join)(__dirname, "..", "..");
fs.writeFileSync((0, path_1.join)(keycloakifyDirPath, "dist", "package.json"), Buffer.from(JSON.stringify((function () {
    var packageJsonParsed = JSON.parse(fs.readFileSync((0, path_1.join)(keycloakifyDirPath, "package.json")).toString("utf8"));
    return __assign(__assign({}, packageJsonParsed), { "main": packageJsonParsed["main"].replace(/^dist\//, ""), "types": packageJsonParsed["types"].replace(/^dist\//, "") });
})(), null, 2), "utf8"));
var commonThirdPartyDeps = (function () {
    var namespaceModuleNames = ["@emotion"];
    var standaloneModuleNames = ["react", "@types/react", "powerhooks", "tss-react", "evt"];
    return __spreadArray(__spreadArray([], __read(namespaceModuleNames
        .map(function (namespaceModuleName) {
        return fs
            .readdirSync((0, path_1.join)(keycloakifyDirPath, "node_modules", namespaceModuleName))
            .map(function (submoduleName) { return namespaceModuleName + "/" + submoduleName; });
    })
        .reduce(function (prev, curr) { return __spreadArray(__spreadArray([], __read(prev), false), __read(curr), false); }, [])), false), __read(standaloneModuleNames), false);
})();
var yarnHomeDirPath = (0, path_1.join)(keycloakifyDirPath, ".yarn_home");
(0, child_process_1.execSync)(["rm -rf", "mkdir"].map(function (cmd) { return cmd + " " + yarnHomeDirPath; }).join(" && "));
var execYarnLink = function (params) {
    var targetModuleName = params.targetModuleName, cwd = params.cwd;
    var cmd = __spreadArray(["yarn", "link"], __read((targetModuleName !== undefined ? [targetModuleName] : [])), false).join(" ");
    console.log("$ cd " + ((0, path_1.relative)(keycloakifyDirPath, cwd) || ".") + " && " + cmd);
    (0, child_process_1.execSync)(cmd, {
        cwd: cwd,
        "env": __assign(__assign({}, process.env), { "HOME": yarnHomeDirPath }),
    });
};
var testAppNames = ["keycloakify-demo-app"];
var getTestAppPath = function (testAppName) { return (0, path_1.join)(keycloakifyDirPath, "..", testAppName); };
testAppNames.forEach(function (testAppName) { return (0, child_process_1.execSync)("yarn install", { "cwd": getTestAppPath(testAppName) }); });
console.log("=== Linking common dependencies ===");
var total = commonThirdPartyDeps.length;
var current = 0;
commonThirdPartyDeps.forEach(function (commonThirdPartyDep) {
    current++;
    console.log(current + "/" + total + " " + commonThirdPartyDep);
    var localInstallPath = path_1.join.apply(void 0, __spreadArray([], __read(__spreadArray([keycloakifyDirPath, "node_modules"], __read((commonThirdPartyDep.startsWith("@") ? commonThirdPartyDep.split("/") : [commonThirdPartyDep])), false)), false));
    execYarnLink({ "cwd": localInstallPath });
    testAppNames.forEach(function (testAppName) {
        return execYarnLink({
            "cwd": getTestAppPath(testAppName),
            "targetModuleName": commonThirdPartyDep,
        });
    });
});
console.log("=== Linking in house dependencies ===");
execYarnLink({ "cwd": (0, path_1.join)(keycloakifyDirPath, "dist") });
testAppNames.forEach(function (testAppName) {
    return execYarnLink({
        "cwd": getTestAppPath(testAppName),
        "targetModuleName": "keycloakify",
    });
});
//# sourceMappingURL=link_in_test_app.js.map