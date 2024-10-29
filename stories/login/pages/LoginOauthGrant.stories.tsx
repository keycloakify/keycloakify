import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

// Mock kcContext to simulate real environment
const mockKcContext = {
    url: {
        oauthAction: "/oauth-action"
    },
    oauth: {
        clientScopesRequested: [{ consentScreenText: "Scope1", dynamicScopeParameter: "dynamicScope1" }, { consentScreenText: "Scope2" }],
        code: "mockCode"
    },
    client: {
        attributes: {
            policyUri: "https://twitter.com/en/tos",
            tosUri: "https://twitter.com/en/privacy"
        },
        name: "Twitter",
        clientId: "twitter-client-id"
    }
};

const { KcPageStory } = createKcPageStory({ pageId: "login-oauth-grant.ftl" });

const meta = {
    title: "login/login-oauth-grant.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default:
 * - Purpose: Tests the default behavior with meaningful logo (Twitter).
 * - Scenario: The component renders with Twitter as the client, displaying its logo, policy, and terms of service links.
 * - Key Aspect: Ensures the component works with a realistic `logoUri` and client name.
 */
export const Default: Story = {
    render: () => <KcPageStory kcContext={mockKcContext} />
};

/**
 * WithoutScopes:
 * - Purpose: Tests the component when no OAuth scopes are requested.
 * - Scenario: The component renders with no scopes listed under the consent screen.
 * - Key Aspect: Ensures the component renders correctly when there are no requested scopes.
 */
export const WithoutScopes: Story = {
    args: {
        kcContext: {
            ...mockKcContext,
            oauth: {
                ...mockKcContext.oauth,
                clientScopesRequested: []
            }
        }
    }
};

/**
 * WithFormSubmissionError:
 * - Purpose: Tests how the component handles form submission errors.
 * - Scenario: The `oauthAction` URL is set to an error route and an error message is displayed.
 * - Key Aspect: Ensures that the component can display error messages when form submission fails.
 */
export const WithFormSubmissionError: Story = {
    args: {
        kcContext: {
            ...mockKcContext,
            url: {
                oauthAction: "/error"
            },
            message: {
                type: "error",
                summary: "An error occurred during form submission."
            }
        }
    }
};
