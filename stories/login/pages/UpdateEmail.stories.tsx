import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "update-email.ftl" });

const meta = {
    title: "login/update-email.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * WithAppInitiatedAction:
 * - Purpose: Tests when the form is displayed as part of an application-initiated action.
 * - Scenario: The component renders the form with additional buttons like "Cancel."
 * - Key Aspect: Ensures the "Cancel" button is visible and functional during app-initiated actions.
 */
export const WithAppInitiatedAction: Story = {
    args: {
        kcContext: {
            url: {
                loginAction: "/mock-login-action"
            },
            messagesPerField: {
                exists: () => false
            },
            isAppInitiatedAction: true
        }
    }
};
