import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "password.ftl" });

const meta = {
    title: "account/password.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

export const WithMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: { type: "success", summary: "This is a test message" }
            }}
        />
    )
};
/**
 * FirstTimePasswordSetup:
 * - Purpose: Tests the page when no password is set (e.g., first login).
 * - Scenario: This renders the form without the current password field.
 * - Key Aspect: Ensures the page only displays fields for setting a new password.
 */
export const FirstTimePasswordSetup: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                account: {
                    username: "john_doe"
                },
                password: {
                    passwordSet: false
                },
                url: {
                    passwordUrl: "/password"
                },
                stateChecker: "state-checker"
            }}
        />
    )
};

/**
 * IncorrectCurrentPassword:
 * - Purpose: Simulates validation error when the current password is incorrect.
 * - Scenario: This renders the page with an error message indicating the current password is incorrect.
 * - Key Aspect: Validates that an error message is correctly displayed for the current password input.
 */
export const IncorrectCurrentPassword: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: { type: "error", summary: "Incorrect current password." },
                account: {
                    username: "john_doe"
                },
                password: {
                    passwordSet: true
                },
                url: {
                    passwordUrl: "/password"
                },
                stateChecker: "state-checker"
            }}
        />
    )
};

/**
 * SubmissionSuccessWithRedirect:
 * - Purpose: Simulates a successful form submission with a redirect or success message.
 * - Scenario: After successfully changing the password, a success message and redirect behavior are triggered.
 * - Key Aspect: Verifies the handling of successful submissions.
 */
export const SubmissionSuccessWithRedirect: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: { type: "success", summary: "Password successfully changed." },
                account: {
                    username: "john_doe"
                },
                password: {
                    passwordSet: true
                },
                url: {
                    passwordUrl: "/password"
                },
                stateChecker: "state-checker"
            }}
        />
    )
};
