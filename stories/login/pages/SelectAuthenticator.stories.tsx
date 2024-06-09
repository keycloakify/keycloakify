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
