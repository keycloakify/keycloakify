import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "webauthn-authenticate.ftl" });

const meta = {
    title: "login/webauthn-authenticate.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * WithMultipleAuthenticators:
 * - Purpose: Tests when multiple WebAuthn authenticators are available for selection.
 * - Scenario: The component renders multiple authenticators, allowing the user to choose between them.
 * - Key Aspect: Ensures that the available authenticators are displayed, and the user can select one.
 */
export const WithMultipleAuthenticators: Story = {
    args: {
        kcContext: {
            url: {
                loginAction: "/mock-login-action"
            },
            authenticators: {
                authenticators: [
                    {
                        credentialId: "authenticator-1",
                        label: "Security Key 1",
                        transports: {
                            iconClass: "kcAuthenticatorUsbIcon",
                            displayNameProperties: ["USB"]
                        },
                        createdAt: "2023-01-01"
                    },
                    {
                        credentialId: "authenticator-2",
                        label: "Security Key 2",
                        transports: {
                            iconClass: "kcAuthenticatorNfcIcon",
                            displayNameProperties: ["NFC"]
                        },
                        createdAt: "2023-02-01"
                    }
                ]
            },
            shouldDisplayAuthenticators: true
        }
    }
};

/**
 * WithSingleAuthenticator:
 * - Purpose: Tests when only one WebAuthn authenticator is available.
 * - Scenario: The component renders the WebAuthn form with a single available authenticator.
 * - Key Aspect: Ensures the form renders correctly when there is only one authenticator available.
 */
export const WithSingleAuthenticator: Story = {
    args: {
        kcContext: {
            url: {
                loginAction: "/mock-login-action"
            },
            authenticators: {
                authenticators: [
                    {
                        credentialId: "authenticator-1",
                        label: "My Security Key",
                        transports: {
                            iconClass: "kcAuthenticatorUsbIcon",
                            displayNameProperties: ["USB"]
                        },
                        createdAt: "2023-01-01"
                    }
                ]
            },
            shouldDisplayAuthenticators: true
        }
    }
};

/**
 * WithErrorDuringAuthentication:
 * - Purpose: Tests the behavior when an error occurs during WebAuthn authentication.
 * - Scenario: The component renders with an error message displayed to the user.
 * - Key Aspect: Ensures the form handles authentication errors and displays a relevant message.
 */
export const WithErrorDuringAuthentication: Story = {
    args: {
        kcContext: {
            url: {
                loginAction: "/mock-login-action"
            },
            authenticators: {
                authenticators: [
                    {
                        credentialId: "authenticator-1",
                        label: "My Security Key",
                        transports: {
                            iconClass: "kcAuthenticatorUsbIcon",
                            displayNameProperties: ["USB"]
                        },
                        createdAt: "2023-01-01"
                    }
                ]
            },
            shouldDisplayAuthenticators: true,
            message: {
                summary: "An error occurred during WebAuthn authentication.",
                type: "error"
            }
        }
    }
};

/**
 * WithJavaScriptDisabled:
 * - Purpose: Tests the behavior when JavaScript is disabled or not functioning.
 * - Scenario: The component renders a fallback message prompting the user to enable JavaScript for WebAuthn authentication.
 * - Key Aspect: Ensures the form provides a clear message when JavaScript is required but unavailable.
 */
export const WithJavaScriptDisabled: Story = {
    args: {
        kcContext: {
            url: {
                loginAction: "/mock-login-action"
            },
            authenticators: {
                authenticators: [
                    {
                        credentialId: "authenticator-1",
                        label: "My Security Key",
                        transports: {
                            iconClass: "kcAuthenticatorUsbIcon",
                            displayNameProperties: ["USB"]
                        },
                        createdAt: "2023-01-01"
                    }
                ]
            },
            shouldDisplayAuthenticators: true
        }
    }
};
