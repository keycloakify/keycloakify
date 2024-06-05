import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../PageStory";

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
                    summary: "Server info message"
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
