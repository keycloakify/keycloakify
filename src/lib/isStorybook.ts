export const isStorybook =
    typeof window === "object" &&
    Object.keys(window).find(key => key.startsWith("__STORYBOOK")) !== undefined;
