import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-otp.ftl" });

const meta = {
    title: "login/login-otp.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

/**
 * MultipleOtpCredentials:
 * - Purpose: Tests the behavior when the user has multiple OTP credentials to choose from.
 * - Scenario: Simulates the scenario where the user is presented with multiple OTP credentials and must select one to proceed.
 * - Key Aspect: Ensures that multiple OTP credentials are listed and selectable, and the correct credential is selected by default.
 */
export const MultipleOtpCredentials: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                otpLogin: {
                    userOtpCredentials: [
                        { id: "credential1", userLabel: "Device 1" },
                        { id: "credential2", userLabel: "Device 2" },
                        { id: "credential3", userLabel: "Device 3" },
                        { id: "credential4", userLabel: "Device 4" },
                        { id: "credential5", userLabel: "Device 5" },
                        { id: "credential6", userLabel: "Device 6" }
                    ],
                    selectedCredentialId: "credential1"
                },
                url: {
                    loginAction: "/login-action"
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
 * - Purpose: Tests the behavior when an error occurs with the OTP field (e.g., invalid OTP code).
 * - Scenario: Simulates an invalid OTP code scenario where an error message is displayed.
 * - Key Aspect: Ensures that the OTP input displays error messages correctly and the error is visible.
 */
export const WithOtpError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                otpLogin: {
                    userOtpCredentials: []
                },
                url: {
                    loginAction: "/login-action"
                },
                messagesPerField: {
                    existsError: (field: string) => field === "totp",
                    get: () => "Invalid OTP code"
                }
            }}
        />
    )
};

/**
 * NoOtpCredentials:
 * - Purpose: Tests the behavior when no OTP credentials are provided for the user.
 * - Scenario: Simulates the scenario where the user is not presented with any OTP credentials, and only the OTP input is displayed.
 * - Key Aspect: Ensures that the component handles cases where there are no user OTP credentials, and the user is only prompted for the OTP code.
 */
export const NoOtpCredentials: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                otpLogin: {
                    userOtpCredentials: []
                },
                url: {
                    loginAction: "/login-action"
                },
                messagesPerField: {
                    existsError: () => false
                }
            }}
        />
    )
};

/**
 * WithErrorAndMultipleOtpCredentials:
 * - Purpose: Tests behavior when there is both an error in the OTP field and multiple OTP credentials.
 * - Scenario: Simulates the case where the user has multiple OTP credentials and encounters an error with the OTP input.
 * - Key Aspect: Ensures that the component can handle both multiple OTP credentials and display an error message simultaneously.
 */
export const WithErrorAndMultipleOtpCredentials: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                otpLogin: {
                    userOtpCredentials: [
                        { id: "credential1", userLabel: "Device 1" },
                        { id: "credential2", userLabel: "Device 2" }
                    ],
                    selectedCredentialId: "credential1"
                },
                url: {
                    loginAction: "/login-action"
                },
                messagesPerField: {
                    existsError: (field: string) => field === "totp",
                    get: () => "Invalid OTP code"
                }
            }}
        />
    )
};
