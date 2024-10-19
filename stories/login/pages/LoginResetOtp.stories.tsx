import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-reset-otp.ftl" });

const meta = {
    title: "login/login-reset-otp.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

/**
 * WithoutOtpCredentials:
 * - Purpose: Tests the behavior when no OTP credentials are available.
 * - Scenario: The component renders without any OTP credentials, showing only the submit button.
 * - Key Aspect: Ensures that the component handles the absence of OTP credentials correctly.
 */
export const WithoutOtpCredentials: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                url: {
                    loginAction: "/mock-login"
                },
                configuredOtpCredentials: {
                    userOtpCredentials: [],
                    selectedCredentialId: undefined
                },
                messagesPerField: {
                    existsError: () => false
                }
            }}
        />
    )
};

/**
 * WithOtpError:
 * - Purpose: Tests the behavior when an error occurs with the OTP selection.
 * - Scenario: Simulates a scenario where an error occurs (e.g., no OTP selected), and an error message is displayed.
 * - Key Aspect: Ensures that error messages are displayed correctly for OTP-related errors.
 */
export const WithOtpError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                url: {
                    loginAction: "/mock-login"
                },
                configuredOtpCredentials: {
                    userOtpCredentials: [
                        { id: "otp1", userLabel: "Device 1" },
                        { id: "otp2", userLabel: "Device 2" }
                    ],
                    selectedCredentialId: "otp1"
                },
                messagesPerField: {
                    existsError: (field: string) => field === "totp",
                    get: () => "Invalid OTP selection"
                }
            }}
        />
    )
};

/**
 * WithOnlyOneOtpCredential:
 * - Purpose: Tests the behavior when there is only one OTP credential available.
 * - Scenario: Simulates the case where the user has only one OTP credential, and it is pre-selected by default.
 * - Key Aspect: Ensures that the component renders correctly with only one OTP credential pre-selected.
 */
export const WithOnlyOneOtpCredential: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                url: {
                    loginAction: "/mock-login"
                },
                configuredOtpCredentials: {
                    userOtpCredentials: [{ id: "otp1", userLabel: "Device 1" }],
                    selectedCredentialId: "otp1"
                },
                messagesPerField: {
                    existsError: () => false
                }
            }}
        />
    )
};
