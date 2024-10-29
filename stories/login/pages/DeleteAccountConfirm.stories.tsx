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

export const Default: Story = {};
export const WithAIAFlow: Story = {
    args: {
        kcContext: {
            triggered_from_aia: true,
            url: { loginAction: "/login-action" }
        }
    }
};
export const WithoutAIAFlow: Story = {
    args: {
        kcContext: {
            triggered_from_aia: false,
            url: { loginAction: "/login-action" }
        }
    }
};
export const WithCustomButtonStyle: Story = {
    args: {
        kcContext: {
            triggered_from_aia: true,
            url: { loginAction: "/login-action" }
        }
    }
};
