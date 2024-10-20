import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-verify-email.ftl" });

const meta = {
    title: "login/login-verify-email.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "You need to verify your email to activate your account.",
                    type: "warning"
                },
                user: {
                    email: "john.doe@gmail.com"
                }
            }}
        />
    )
};

/**
 * WithSuccessMessage:
 * - Purpose: Tests when the email verification is successful, and the user receives a confirmation message.
 * - Scenario: The component renders a success message instead of a warning or error.
 * - Key Aspect: Ensures the success message is displayed correctly when the email is successfully verified.
 */
export const WithSuccessMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "Your email has been successfully verified.",
                    type: "success"
                },
                user: {
                    email: "john.doe@gmail.com"
                },
                url: {
                    loginAction: "/mock-login-action"
                }
            }}
        />
    )
};

/**
 * WithErrorMessage:
 * - Purpose: Tests when there is an error during the email verification process.
 * - Scenario: The component renders an error message indicating the email verification failed.
 * - Key Aspect: Ensures the error message is shown correctly when the verification process encounters an issue.
 */
export const WithErrorMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "There was an error verifying your email. Please try again.",
                    type: "error"
                },
                user: {
                    email: "john.doe@gmail.com"
                },
                url: {
                    loginAction: "/mock-login-action"
                }
            }}
        />
    )
};

/**
 * WithInfoMessage:
 * - Purpose: Tests when the user is prompted to verify their email without any urgency.
 * - Scenario: The component renders with an informational message for email verification.
 * - Key Aspect: Ensures the informational message is displayed properly.
 */
export const WithInfoMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "Please verify your email to continue using our services.",
                    type: "info"
                },
                user: {
                    email: "john.doe@gmail.com"
                },
                url: {
                    loginAction: "/mock-login-action"
                }
            }}
        />
    )
};
