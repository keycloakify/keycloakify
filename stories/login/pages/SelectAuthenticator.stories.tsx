import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "select-authenticator.ftl" });

const meta = {
    title: "login/select-authenticator.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

export const WithDifferentAuthenticationMethods: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                auth: {
                    authenticationSelections: [
                        {
                            authExecId: "25697c4e-0c80-4f2c-8eb7-2c16347e8e8d",
                            displayName: "auth-username-password-form-display-name",
                            helpText: "auth-username-password-form-help-text",
                            iconCssClass: "kcAuthenticatorPasswordClass"
                        },
                        {
                            authExecId: "4cb60872-ce0d-4c8f-a806-e651ed77994b",
                            displayName: "webauthn-passwordless-display-name",
                            helpText: "webauthn-passwordless-help-text",
                            iconCssClass: "kcAuthenticatorWebAuthnPasswordlessClass"
                        }
                    ]
                }
            }}
        />
    )
};

export const WithRealmTranslations: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                auth: {
                    authenticationSelections: [
                        {
                            authExecId: "f0c22855-eda7-4092-8565-0c22f77d2ffb",
                            displayName: "home-idp-discovery-display-name",
                            helpText: "home-idp-discovery-help-text",
                            iconCssClass: "kcAuthenticatorDefaultClass"
                        }
                    ]
                },
                ["x-keycloakify"]: {
                    messages: {
                        "${home-idp-discovery-display-name}": "Home identity provider",
                        "${home-idp-discovery-help-text}":
                            "Sign in via your home identity provider which will be automatically determined based on your provided email address."
                    }
                }
            }}
        />
    )
};
