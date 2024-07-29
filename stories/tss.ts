import { createTss } from "tss-react";
import { useDarkMode } from "storybook-dark-mode";
import { darkTheme, lightTheme } from "../.storybook/customTheme";

function useContext() {
    const isDark = useDarkMode();

    return { isDark, theme: isDark ? darkTheme : lightTheme };
}

export const { tss } = createTss({
    useContext
});
