import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "info.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<any> = {
    title: `login/${pageId}`,
    component: PageStory,
    parameters: {
        viewMode: "story",
        previewTabs: {
            "storybook/docs/panel": {
                hidden: true
            }
        }
    }
};

export default meta;

export const Default = () => (
    <PageStory
        kcContext={{
            message: {
                summary: "Server info message",
                type: "info"
            }
        }}
    />
);

export const WithWarning = () => (
    <PageStory
        kcContext={{
            message: {
                summary: "Server warning message",
                type: "warning"
            }
        }}
    />
);

export const WithError = () => (
    <PageStory
        kcContext={{
            message: {
                summary: "Server error message",
                type: "error"
            }
        }}
    />
);

export const WithSuccess = () => (
    <PageStory
        kcContext={{
            message: {
                summary: "Server success message",
                type: "success"
            }
        }}
    />
);

export const WithLinkBack = () => (
    <PageStory
        kcContext={{
            message: {
                summary: "Server message"
            },
            actionUri: undefined
        }}
    />
);

export const WithRequiredActions = () => (
    <PageStory
        kcContext={{
            message: {
                summary: "Server message"
            },
            requiredActions: ["CONFIGURE_TOTP", "UPDATE_PROFILE", "VERIFY_EMAIL"]
        }}
    />
);
