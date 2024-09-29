import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "delete-account-confirm.ftl" });

const meta = {
    title: "login/delete-account-confirm.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};
export const WithAIAFlow: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                triggered_from_aia: true,
                url: { loginAction: "/login-action" }
            }}
        />
    )
};
export const WithoutAIAFlow: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                triggered_from_aia: false,
                url: { loginAction: "/login-action" }
            }}
        />
    )
};
export const WithCustomButtonStyle: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                triggered_from_aia: true,
                url: { loginAction: "/login-action" }
            }}
        />
    )
};
