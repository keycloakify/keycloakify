import { createMakeStyles } from "tss-react";

const { useStyles } = createMakeStyles({
    "useTheme": () => ({})
});

export function useCssAndCx() {
    const { css, cx } = useStyles();

    return { css, cx };
}
