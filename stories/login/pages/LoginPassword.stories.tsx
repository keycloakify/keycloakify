import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-password.ftl" });

const meta = {
    title: "login/login-password.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

/**
 * WithPasswordError:
 * - Purpose: Tests the behavior when an error occurs in the password field (e.g., incorrect password).
 * - Scenario: Simulates a scenario where an invalid password is entered, and an error message is displayed.
 * - Key Aspect: Ensures that the password input field displays error messages correctly.
 */
export const WithPasswordError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    resetPasswordAllowed: true
                },
                url: {
                    loginAction: "/mock-login",
                    loginResetCredentialsUrl: "/mock-reset-password"
                },
                messagesPerField: {
                    existsError: (field: string) => field === "password",
                    get: () => "Invalid password"
                }
            }}
        />
    )
};

/**
 * WithoutResetPasswordOption:
 * - Purpose: Tests the behavior when the reset password option is disabled.
 * - Scenario: Simulates a scenario where the `resetPasswordAllowed` is set to `false`, and the "Forgot Password" link is not rendered.
 * - Key Aspect: Ensures that the component handles cases where resetting the password is not allowed.
 */
export const WithoutResetPasswordOption: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    resetPasswordAllowed: false
                },
                url: {
                    loginAction: "/mock-login",
                    loginResetCredentialsUrl: "/mock-reset-password"
                },
                messagesPerField: {
                    existsError: () => false
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
export const WithAuthPassKey: Story = {
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
