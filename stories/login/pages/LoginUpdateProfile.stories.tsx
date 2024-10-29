import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-update-profile.ftl" });

const meta = {
    title: "login/login-update-profile.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * WithProfileError:
 * - Purpose: Tests when an error occurs in one or more profile fields (e.g., invalid email format).
 * - Scenario: The component displays error messages next to the affected fields.
 * - Key Aspect: Ensures the profile fields show error messages when validation fails.
 */
export const WithProfileError: Story = {
    args: {
        kcContext: {
            url: {
                loginAction: "/mock-login-action"
            },
            messagesPerField: {
                existsError: (field: string) => field === "email",
                get: () => "Invalid email format"
            },
            isAppInitiatedAction: false
        }
    }
};
