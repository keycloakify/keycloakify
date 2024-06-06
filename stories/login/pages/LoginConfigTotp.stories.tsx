import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../PageStory";

const { PageStory } = createPageStory({ pageId: "login-config-totp.ftl" });

const meta = {
    title: "login/login-config-totp.ftl",
    component: PageStory
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
