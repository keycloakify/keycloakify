import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory, parameters } from "../createPageStory";

const pageId = "select-authenticator.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<any> = {
    title: `login/${pageId}`,
    component: PageStory,
    parameters
};

export default meta;

export const Default = () => <PageStory />;

export const WithDifferentAuthenticationMethods = () => (
    <PageStory
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
);
