import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-username.ftl" });

const meta = {
    title: "login/login-username.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

export const WithEmailAsUsername: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    loginWithEmailAllowed: true,
                    registrationEmailAsUsername: true
                }
            }}
        />
    )
};
/**
 * WithAuthPassKey:
 * - Purpose: Test usage of Sign In With Pass Key integration
 * - Scenario: Simulates a scenario where the `Sign In with Passkey` button is rendered below `Sign In` button.
 * - Key Aspect: Ensure that it is displayed correctly.
 */
export const WithAuthPasskey: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                url: {
                    loginAction: "/mock-login-action"
                },
                enableWebAuthnConditionalUI: true
            }}
        />
    )
};
