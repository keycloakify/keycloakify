module.exports = {
    stories: [
        "../stories/**/*.stories.tsx"
    ],
    addons: [
        "storybook-dark-mode",
        "@storybook/addon-a11y"
    ],
    core: {
        builder: "webpack5"
    },
    staticDirs: ["./static", "../dist/res/public"]
};
