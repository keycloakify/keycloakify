import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../PageStory";

const pageId = "login-config-totp.ftl";

const { PageStory } = createPageStory({ pageId });

const meta = {
    title: `login/${pageId}`,
    component: PageStory,
    parameters
} satisfies Meta<typeof PageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <PageStory />
};

export const WithManualSetUp: Story = {
    render: () => (
        <PageStory
            kcContext={{
                mode: "manual"
            }}
        />
    )
};

export const WithError: Story = {
    render: () => (
        <PageStory
            kcContext={{
                messagesPerField: {
                    get: (fieldName: string) => (fieldName === "totp" ? "Invalid TOTP" : undefined),
                    exists: (fieldName: string) => fieldName === "totp",
                    existsError: (fieldName: string) => fieldName === "totp",
                    printIfExists: <T,>(fieldName: string, x: T) => (fieldName === "totp" ? x : undefined)
                }
            }}
        />
    )
};
