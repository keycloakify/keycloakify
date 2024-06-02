import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../createPageStory";

const pageId = "login.ftl";

const { PageStory } = createPageStory({ pageId });

const meta = {
    title: `login/${pageId}`,
    component: PageStory,
    parameters
} satisfies Meta<typeof PageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <PageStory />
};

export const WithoutPasswordField: Story = {
    render: () => (
        <PageStory
            kcContext={{
                realm: { password: false }
            }}
        />
    )
};

export const WithoutRegistration: Story = {
    render: () => (
        <PageStory
            kcContext={{
                realm: { registrationAllowed: false }
            }}
        />
    )
};

export const WithoutRememberMe: Story = {
    render: () => (
        <PageStory
            kcContext={{
                realm: { rememberMe: false }
            }}
        />
    )
};

export const WithoutPasswordReset: Story = {
    render: () => (
        <PageStory
            kcContext={{
                realm: { resetPasswordAllowed: false }
            }}
        />
    )
};

export const WithEmailAsUsername: Story = {
    render: () => (
        <PageStory
            kcContext={{
                realm: { loginWithEmailAllowed: false }
            }}
        />
    )
};

export const WithPresetUsername: Story = {
    render: () => (
        <PageStory
            kcContext={{
                login: { username: "max.mustermann@mail.com" }
            }}
        />
    )
};

export const WithImmutablePresetUsername: Story = {
    render: () => (
        <PageStory
            kcContext={{
                auth: {
                    attemptedUsername: "max.mustermann@mail.com",
                    showUsername: true
                },
                usernameHidden: true,
                message: {
                    type: "info",
                    summary: "Please re-authenticate to continue"
                }
            }}
        />
    )
};

export const WithSocialProviders: Story = {
    render: () => (
        <PageStory
            kcContext={{
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google"
                        },
                        {
                            loginUrl: "microsoft",
                            alias: "microsoft",
                            providerId: "microsoft",
                            displayName: "Microsoft"
                        },
                        {
                            loginUrl: "facebook",
                            alias: "facebook",
                            providerId: "facebook",
                            displayName: "Facebook"
                        },
                        {
                            loginUrl: "instagram",
                            alias: "instagram",
                            providerId: "instagram",
                            displayName: "Instagram"
                        },
                        {
                            loginUrl: "twitter",
                            alias: "twitter",
                            providerId: "twitter",
                            displayName: "Twitter"
                        },
                        {
                            loginUrl: "linkedin",
                            alias: "linkedin",
                            providerId: "linkedin",
                            displayName: "LinkedIn"
                        },
                        {
                            loginUrl: "stackoverflow",
                            alias: "stackoverflow",
                            providerId: "stackoverflow",
                            displayName: "Stackoverflow"
                        },
                        {
                            loginUrl: "github",
                            alias: "github",
                            providerId: "github",
                            displayName: "Github"
                        },
                        {
                            loginUrl: "gitlab",
                            alias: "gitlab",
                            providerId: "gitlab",
                            displayName: "Gitlab"
                        },
                        {
                            loginUrl: "bitbucket",
                            alias: "bitbucket",
                            providerId: "bitbucket",
                            displayName: "Bitbucket"
                        },
                        {
                            loginUrl: "paypal",
                            alias: "paypal",
                            providerId: "paypal",
                            displayName: "PayPal"
                        },
                        {
                            loginUrl: "openshift",
                            alias: "openshift",
                            providerId: "openshift",
                            displayName: "OpenShift"
                        }
                    ]
                }
            }}
        />
    )
};
