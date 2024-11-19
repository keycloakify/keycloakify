import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "account.ftl" });

const meta = {
    title: "account/account.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * UsernameNotEditable:
 * - Purpose: Test the scenario where the username field is not editable.
 * - Scenario: The component renders, but the username field is disabled.
 * - Key Aspect: Ensures that the `editUsernameAllowed` condition is respected and the username field is read-only.
 */
export const UsernameNotEditable: Story = {
    args: {
        kcContext: {
            account: {
                username: "john_doe",
                email: "john.doe@gmail.com",
                firstName: "John",
                lastName: "Doe"
            },
            realm: {
                registrationEmailAsUsername: false,
                editUsernameAllowed: false
            },
            referrer: {
                url: "/home"
            },
            url: {
                accountUrl: "/account"
            },
            messagesPerField: {
                printIfExists: () => ""
            },
            stateChecker: "state-checker"
        }
    }
};

/**
 * WithValidationErrors:
 * - Purpose: Test the form when there are validation errors.
 * - Scenario: The component renders with error messages for invalid input in the fields.
 * - Key Aspect: Ensures that error messages are properly displayed and the user can correct their inputs.
 */
export const WithValidationErrors: Story = {
    args: {
        kcContext: {
            account: {
                username: "john_doe",
                email: "",
                firstName: "",
                lastName: "Doe"
            },
            realm: {
                registrationEmailAsUsername: false,
                editUsernameAllowed: true
            },
            referrer: {
                url: "/home"
            },
            url: {
                accountUrl: "/account"
            },
            messagesPerField: {
                printIfExists: field => (field === "email" || field === "firstName" ? "has-error" : "")
            },
            stateChecker: "state-checker"
        }
    }
};
/**
 * EmailAsUsername:
 * - Purpose: Test the form where email is used as the username.
 * - Scenario: The component renders without a separate username field, and the email field is treated as the username.
 * - Key Aspect: Ensures the form functions correctly when `registrationEmailAsUsername` is enabled.
 */
export const EmailAsUsername: Story = {
    args: {
        kcContext: {
            account: {
                email: "john.doe@gmail.com",
                firstName: "John",
                lastName: "Doe"
            },
            realm: {
                registrationEmailAsUsername: true
            },
            referrer: {
                url: "/home"
            },
            url: {
                accountUrl: "/account"
            },
            messagesPerField: {
                printIfExists: () => ""
            },
            stateChecker: "state-checker"
        }
    }
};
