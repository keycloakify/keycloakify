import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "register.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<any> = {
    title: `login/${pageId}`,
    component: PageStory,
    parameters: {
        viewMode: "story",
        previewTabs: {
            "storybook/docs/panel": {
                hidden: true
            }
        }
    }
};

export default meta;

export const Default = () => <PageStory />;

export const WithFieldError = () => (
    <PageStory
        kcContext={{
            profile: {
                attributes: [
                    {
                        name: "email",
                        value: "max.mustermann@gmail.com"
                    }
                ]
            },
            messagesPerField: {
                existsError: (fieldName: string) => fieldName === "email",
                exists: (fieldName: string) => fieldName === "email",
                get: (fieldName: string) => (fieldName === "email" ? "I don't like your email address" : undefined),
                printIfExists: <T,>(fieldName: string, x: T) => (fieldName === "email" ? x : undefined)
            }
        }}
    />
);

export const WithEmailAsUsername = () => (
    <PageStory
        kcContext={{
            realm: {
                registrationEmailAsUsername: true
            }
        }}
    />
);

export const WithoutPassword = () => (
    <PageStory
        kcContext={{
            passwordRequired: false
        }}
    />
);

export const WithRecaptcha = () => (
    <PageStory
        kcContext={{
            recaptchaRequired: true,
            recaptchaSiteKey: "foobar"
        }}
    />
);

export const WithPresets = () => (
    <PageStory
        kcContext={{
            profile: {
                attributes: [
                    {
                        name: "firstName",
                        value: "Max"
                    },
                    {
                        name: "lastName",
                        value: "Mustermann"
                    },
                    {
                        name: "email",
                        value: "max.mustermann@gmail.com"
                    },
                    {
                        name: "username",
                        value: "max.mustermann"
                    }
                ]
            }
        }}
    />
);
