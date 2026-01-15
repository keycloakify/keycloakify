import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "link-idp-action.ftl" });

const meta = {
    title: "login/link-idp-action.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                idpDisplayName: "GitHub",
                url: { loginAction: "/mock-login-action" }
            }}
        />
    )
};

export const DifferentProvider: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                idpDisplayName: "Google",
                url: { loginAction: "/custom-login-action" }
            }}
        />
    )
};
