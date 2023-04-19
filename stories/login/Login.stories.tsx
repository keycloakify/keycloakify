import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory } from "./createPageStory";

const pageId = "login.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<any> = {
    "title": `login/${pageId}`,
    "component": PageStory,
    "parameters": {
        "viewMode": "story",
        "previewTabs": {
            "storybook/docs/panel": {
                "hidden": true
            }
        }
    }
};

export default meta;

export const Default = () => <PageStory />;

export const WithoutPasswordField = () => (
    <PageStory
        kcContext={{
            realm: { password: false }
        }}
    />
);

export const WithoutRegistration = () => (
    <PageStory
        kcContext={{
            realm: { registrationAllowed: false }
        }}
    />
);

export const WithoutRememberMe = () => (
    <PageStory
        kcContext={{
            realm: { rememberMe: false }
        }}
    />
);

export const WithoutPasswordReset = () => (
    <PageStory
        kcContext={{
            realm: { resetPasswordAllowed: false }
        }}
    />
);

export const WithEmailAsUsername = () => (
    <PageStory
        kcContext={{
            realm: { loginWithEmailAllowed: false }
        }}
    />
);

export const WithPresetUsername = () => (
    <PageStory
        kcContext={{
            login: { username: "max.mustermann@mail.com" }
        }}
    />
);

export const WithImmutablePresetUsername = () => (
    <PageStory
        kcContext={{
            login: { username: "max.mustermann@mail.com" },
            usernameEditDisabled: true
        }}
    />
);

export const WithSocialProviders = () => (
    <PageStory
        kcContext={{
            social: {
                displayInfo: true,
                providers: [
                    { loginUrl: "google", alias: "google", providerId: "google", displayName: "Google" },
                    { loginUrl: "microsoft", alias: "microsoft", providerId: "microsoft", displayName: "Microsoft" },
                    { loginUrl: "facebook", alias: "facebook", providerId: "facebook", displayName: "Facebook" },
                    { loginUrl: "instagram", alias: "instagram", providerId: "instagram", displayName: "Instagram" },
                    { loginUrl: "twitter", alias: "twitter", providerId: "twitter", displayName: "Twitter" },
                    { loginUrl: "linkedin", alias: "linkedin", providerId: "linkedin", displayName: "LinkedIn" },
                    { loginUrl: "stackoverflow", alias: "stackoverflow", providerId: "stackoverflow", displayName: "Stackoverflow" },
                    { loginUrl: "github", alias: "github", providerId: "github", displayName: "Github" },
                    { loginUrl: "gitlab", alias: "gitlab", providerId: "gitlab", displayName: "Gitlab" },
                    { loginUrl: "bitbucket", alias: "bitbucket", providerId: "bitbucket", displayName: "Bitbucket" },
                    { loginUrl: "paypal", alias: "paypal", providerId: "paypal", displayName: "PayPal" },
                    { loginUrl: "openshift", alias: "openshift", providerId: "openshift", displayName: "OpenShift" }
                ]
            }
        }}
    />
);
