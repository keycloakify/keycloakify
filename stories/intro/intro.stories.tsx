import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { KeycloakifyRotatingLogo } from "./KeycloakifyRotatingLogo";
import { useInsertLinkTags } from "../../dist/tools/useInsertLinkTags";
import { tss } from "../tss";

const meta = {
    title: "Introduction"
} satisfies Meta<any>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WhatIsThisWebsite: Story = {
    render: () => <Introduction />
};

function Introduction() {
    console.log(window.location.href);

    useInsertLinkTags({
        componentOrHookName: "Template",
        hrefs: []
    });

    const { classes, theme } = useStyles();

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <div className={classes.keycloakifyLogoWrapper}>
                    <KeycloakifyRotatingLogo className={classes.keycloakifyLogo} />
                </div>
                <h1>
                    <a href={theme.brandUrl}>Keycloakify </a> Storybook
                </h1>

                <p>
                    This website showcases all the Keycloak user-facing pages of the Login and{" "}
                    <a href="https://docs.keycloakify.dev/account-theme#multi-page">Account Multi-Page theme</a>.<br />
                    The storybook serves as a reference to help you determine which pages you would like to personalize.
                    <br />
                    These pages are a direct React adaptation of the{" "}
                    <a href="https://github.com/keycloak/keycloak/tree/24.0.4/themes/src/main/resources/theme/base" target="_blank">
                        built-in FreeMarker Keycloak pages
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}

const useStyles = tss.withName({ Introduction }).create(({ isDark, theme }) => ({
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
        textAlign: "center"
    },
    keycloakifyLogoWrapper: {
        display: "flex",
        justifyContent: "center"
    },
    keycloakifyLogo: {
        width: 400
    }
}));
