module.exports = {
    "stories": [
        "../stories/**/*.stories.@(ts|tsx|mdx)"
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
