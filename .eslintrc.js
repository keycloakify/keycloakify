module.exports = {
    "root": true,
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "@typescript-eslint",
    ],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
    ],
    "rules": {
        "no-extra-boolean-cast": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
    },
};