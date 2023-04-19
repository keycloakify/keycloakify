module.exports = {
    "stories": [
        "../stories/*.stories.mdx",
        "../stories/*.stories.@(ts|tsx)",
        "../stories/**/*.stories.@(ts|tsx)"
    ],
    "addons": [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "storybook-dark-mode",
        "@storybook/addon-a11y"
    ],
    "core": {
        "builder": "webpack5"
    },
    "staticDirs": ["./static"]
};
