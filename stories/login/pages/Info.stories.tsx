import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../createPageStory";

const pageId = "info.ftl";

const { PageStory } = createPageStory({ pageId });

const meta = {
    title: `login/${pageId}`,
    component: PageStory,
    parameters
} satisfies Meta<typeof PageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <PageStory
            kcContext={{
                message: {
                    summary: "Server info message",
                    type: "info"
                }
            }}
        />
    )
};

export const WithWarning: Story = {
    render: () => (
        <PageStory
            kcContext={{
                message: {
                    summary: "Server warning message",
                    type: "warning"
                }
            }}
        />
    )
};

export const WithError: Story = {
    render: () => (
        <PageStory
            kcContext={{
                message: {
                    summary: "Server error message",
                    type: "error"
                }
            }}
        />
    )
};

export const WithSuccess: Story = {
    render: () => (
        <PageStory
            kcContext={{
                message: {
                    summary: "Server success message",
                    type: "success"
                }
            }}
        />
    )
};

export const WithLinkBack: Story = {
    render: () => (
        <PageStory
            kcContext={{
                message: {
                    summary: "Server message"
                },
                actionUri: undefined
            }}
        />
    )
};

export const WithRequiredActions: Story = {
    render: () => (
        <PageStory
            kcContext={{
                message: {
                    summary: "Server message"
                },
                requiredActions: ["CONFIGURE_TOTP", "UPDATE_PROFILE", "VERIFY_EMAIL"]
            }}
        />
    )
};
