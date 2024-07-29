import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useInsertLinkTags } from "../../dist/tools/useInsertLinkTags";
import { tss } from "../tss";
// @ts-expect-error
import screenshotPngUrl from "./screenshot.png";

const meta = {
    title: "Account SPA/index.ftl"
} satisfies Meta<any>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NotInStorybookButSupported: Story = {
    render: () => <AccountSpa />
};

function AccountSpa() {
    console.log(window.location.href);

    useInsertLinkTags({
        componentOrHookName: "Template",
        hrefs: []
    });

    const { classes, theme } = useStyles();

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <p>
                    Keycloakify offers two option for creating an account theme:{" "}
                    <a href="https://docs.keycloakify.dev/account-theme#multi-page" target="_blank">
                        Multi Page
                    </a>{" "}
                    or{" "}
                    <a href="https://docs.keycloakify.dev/account-theme#single-page" target="_blank">
                        Single Page
                    </a>
                    . Since the account Single Page does not support Storybook, here is a screenshot of it's default look:
                    <br />
                    <br />
                    <img className={classes.screenshot} alt="image" src={screenshotPngUrl} />
                    <br />
                    <a href="https://docs.keycloakify.dev/account-theme" target="_blank">
                        Learn more
                    </a>
                </p>
            </div>
        </div>
    );
}

const useStyles = tss.withName({ AccountSpa }).create(({ isDark, theme }) => ({
    root: {
        height: "100vh",
        color: isDark ? "white" : "black",
        backgroundColor: theme.appContentBg,
        fontFamily: "'Work Sans'",
        fontSize: "14px",
        lineHeight: "24px",
        WebkitFontSmoothing: "antialiased",
        "& a": {
            color: theme.colorSecondary,
            textDecoration: "none",
            "&:hover": {
                textDecoration: "underline"
            }
        },
        "& h1": {
            fontSize: "32px",
            marginBottom: 35
        },
        display: "flex",
        justifyContent: "center"
    },
    content: {
        maxWidth: 750,
        textAlign: "center",
        marginTop: 100
    },
    keycloakifyLogoWrapper: {
        display: "flex",
        justifyContent: "center"
    },
    keycloakifyLogo: {
        width: 400
    },
    screenshot: {
        maxWidth: "100%"
    }
}));
