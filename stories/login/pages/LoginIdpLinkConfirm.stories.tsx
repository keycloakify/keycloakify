import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

// Mock kcContext to avoid the TS2304 error
const mockKcContext = {
    url: {
        loginAction: "/login-action"
    },
    idpAlias: "mockIdpAlias"
};

const { KcPageStory } = createKcPageStory({ pageId: "login-idp-link-confirm.ftl" });

const meta = {
    title: "login/login-idp-link-confirm.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default:
 * - Purpose: Tests standard behavior with mock data.
 * - Scenario: The component renders with a mocked identity provider alias (`mockIdpAlias`) and a login action URL (`/login-action`).
 * - Key Aspect: Ensures the default behavior of the component with standard values for kcContext.
 */
export const Default: Story = {
    render: () => <KcPageStory kcContext={mockKcContext} />
};

/**
 * WithFormSubmissionError:
 * - Purpose: Tests how the component handles form submission errors.
 * - Scenario: Simulates a form submission error by setting the login action URL to `/error` and displays an error message.
 * - Key Aspect: Verifies that the component can display error messages during form submission failure, ensuring proper error handling.
 */
export const WithFormSubmissionError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                ...mockKcContext,
                url: {
                    loginAction: "/error"
                },
                message: {
                    type: "error",
                    summary: "An error occurred during form submission."
                }
            }}
        />
    )
};
