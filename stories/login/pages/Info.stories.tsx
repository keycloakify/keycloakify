import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../PageStory";

const { PageStory } = createPageStory({ pageId: "info.ftl" });

const meta = {
    title: "login/info.ftl",
    component: PageStory
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
