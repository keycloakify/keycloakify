module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
        "plugin:storybook/recommended"
    ],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    parser: "@typescript-eslint/parser",
    plugins: ["react-refresh"],
    rules: {
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        "react-hooks/exhaustive-deps": "off",
        "@typescript-eslint/no-redeclare": "off",
        "no-labels": "off"
    },
    overrides: [
        {
            files: ["**/*.stories.*"],
            rules: {
                "import/no-anonymous-default-export": "off"
            }
        }
    ]
};
