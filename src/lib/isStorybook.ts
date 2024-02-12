export const isStorybook = Object.keys(window).find(key => key.startsWith("__STORYBOOK")) !== undefined;
