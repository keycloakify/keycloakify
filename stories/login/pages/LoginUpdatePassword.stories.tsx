import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-update-password.ftl" });

const meta = {
    title: "login/login-update-password.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

/**
 * WithPasswordError:
 * - Purpose: Tests when there is an error in the password input (e.g., invalid password).
 * - Scenario: Simulates the case where the user enters an invalid password, and an error message is displayed.
 * - Key Aspect: Ensures the password input field shows an error message when validation fails.
 */
export const WithPasswordError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                url: {
                    loginAction: "/mock-login-action"
                },
                messagesPerField: {
                    existsError: (field: string) => field === "password",
                    get: () => "Password must be at least 8 characters long."
                },
                isAppInitiatedAction: false
            }}
        />
    )
};

/**
 * WithPasswordConfirmError:
 * - Purpose: Tests when there is an error in the password confirmation input (e.g., passwords do not match).
 * - Scenario: Simulates the case where the user enters mismatching passwords, and an error message is displayed in the confirmation field.
 * - Key Aspect: Ensures that the password confirmation field shows an error when passwords do not match.
 */
export const WithPasswordConfirmError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                url: {
                    loginAction: "/mock-login-action"
                },
                messagesPerField: {
                    existsError: (field: string) => field === "password-confirm",
                    get: () => "Passwords do not match."
                },
                isAppInitiatedAction: false
            }}
        />
    )
};
