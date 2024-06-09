import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "register.ftl" });

const meta = {
    title: "login/register.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

export const WithFieldError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        email: {
                            value: "max.mustermann@gmail.com"
                        }
                    }
                },
                messagesPerField: {
                    existsError: (fieldName: string) => fieldName === "email",
                    exists: (fieldName: string) => fieldName === "email",
                    get: (fieldName: string) => (fieldName === "email" ? "I don't like your email address" : undefined),
                    printIfExists: <T,>(fieldName: string, x: T) => (fieldName === "email" ? x : undefined)
                }
            }}
        />
    )
};

export const WithEmailAsUsername: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    registrationEmailAsUsername: true
                }
            }}
        />
    )
};

export const WithoutPassword: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                passwordRequired: false
            }}
        />
    )
};

export const WithRecaptcha: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                scripts: ["https://www.google.com/recaptcha/api.js?hl=en"],
                recaptchaRequired: true,
                recaptchaSiteKey: "6LfQHvApAAAAAE73SYTd5vS0lB1Xr7zdiQ-6iBVa"
            }}
        />
    )
};

export const WithRecaptchaFrench: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "fr"
                },
                scripts: ["https://www.google.com/recaptcha/api.js?hl=fr"],
                recaptchaRequired: true,
                recaptchaSiteKey: "6LfQHvApAAAAAE73SYTd5vS0lB1Xr7zdiQ-6iBVa"
            }}
        />
    )
};

export const WithPresets: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        firstName: {
                            value: "Max"
                        },
                        lastName: {
                            value: "Mustermann"
                        },
                        email: {
                            value: "max.mustermann@gmail.com"
                        },
                        username: {
                            value: "max.mustermann"
                        }
                    }
                }
            }}
        />
    )
};
