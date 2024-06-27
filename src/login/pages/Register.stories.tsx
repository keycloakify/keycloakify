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

export const WithEmailAlreadyExists: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        username: {
                            value: "johndoe"
                        },
                        email: {
                            value: "jhon.doe@gmail.com"
                        },
                        firstName: {
                            value: "John"
                        },
                        lastName: {
                            value: "Doe"
                        }
                    }
                },
                messagesPerField: {
                    // NOTE: The other functions of messagesPerField are derived from get() and
                    // existsError() so they are the only ones that need to mock.
                    existsError: (fieldName: string, ...otherFieldNames: string[]) => [fieldName, ...otherFieldNames].includes("email"),
                    get: (fieldName: string) => (fieldName === "email" ? "Email already exists." : undefined)
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

export const WithPasswordMinLength8: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                passwordPolicies: {
                    length: 8
                }
            }}
        />
    )
};
