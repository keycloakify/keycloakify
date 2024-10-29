import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-oauth2-device-verify-user-code.ftl" });

const meta = {
    title: "login/login-oauth2-device-verify-user-code.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * WithErrorMessage:
 * - Purpose: Tests when there is an error with the OAuth2 device user code entry.
 * - Scenario: The component renders with an error message displayed to the user.
 * - Key Aspect: Ensures the error message is properly shown when the user enters an invalid code.
 */
export const WithErrorMessage: Story = {
    args: {
        kcContext: {
            url: {
                oauth2DeviceVerificationAction: "/mock-oauth2-device-verification"
            },
            message: {
                summary: "The user code you entered is invalid. Please try again.",
                type: "error"
            }
        }
    }
};

/**
 * WithEmptyInputField:
 * - Purpose: Tests when the user code field is left empty.
 * - Scenario: The component renders the form, and the user tries to submit without entering any code.
 * - Key Aspect: Ensures the form displays validation errors when the field is left empty.
 */
export const WithEmptyInputField: Story = {
    args: {
        kcContext: {
            url: {
                oauth2DeviceVerificationAction: "/mock-oauth2-device-verification"
            },
            message: {
                summary: "User code cannot be empty. Please enter a valid code.",
                type: "error"
            }
        }
    }
};
