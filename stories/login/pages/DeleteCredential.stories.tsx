import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "delete-credential.ftl" });

const meta = {
    title: "login/delete-credential.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithCustomCredentialLabel: Story = {
    args: {
        kcContext: {
            credentialLabel: "Test Credential",
            url: { loginAction: "/login-action" }
        }
    }
};
