import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";
import type { Attribute } from "../../../dist/login";

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

export const WithRestrictedToMITStudents: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        email: {
                            validators: {
                                pattern: {
                                    pattern: "^[^@]+@([^.]+\\.)*((mit\\.edu)|(berkeley\\.edu))$",
                                    "error-message": "${profile.attributes.email.pattern.error}"
                                }
                            },
                            annotations: {
                                inputHelperTextBefore: "${profile.attributes.email.inputHelperTextBefore}"
                            }
                        }
                    }
                },
                "x-keycloakify": {
                    messages: {
                        "profile.attributes.email.inputHelperTextBefore": "Please use your MIT or Berkeley email.",
                        "profile.attributes.email.pattern.error":
                            "This is not an MIT (<strong>@mit.edu</strong>) nor a Berkeley (<strong>@berkeley.edu</strong>) email."
                    }
                }
            }}
        />
    )
};

export const WithFavoritePet: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        favoritePet: {
                            name: "favorite-pet",
                            displayName: "${profile.attributes.favoritePet}",
                            validators: {
                                options: {
                                    options: ["cat", "dog", "fish"]
                                }
                            },
                            annotations: {
                                inputOptionLabelsI18nPrefix: "profile.attributes.favoritePet.options"
                            },
                            required: false,
                            readOnly: false
                        } satisfies Attribute
                    }
                },
                "x-keycloakify": {
                    messages: {
                        "profile.attributes.favoritePet": "Favorite Pet",
                        "profile.attributes.favoritePet.options.cat": "Fluffy Cat",
                        "profile.attributes.favoritePet.options.dog": "Loyal Dog",
                        "profile.attributes.favoritePet.options.fish": "Peaceful Fish"
                    }
                }
            }}
        />
    )
};


export const WithNewsletter: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        newsletter: {
                            name: "newsletter",
                            displayName: "Sign up to the newsletter",
                            validators: {
                                options: {
                                    options: ["yes"]
                                }
                            },
                            annotations: {
                                inputOptionLabels: {
                                    "yes": "I want my email inbox filled with spam"
                                },
                                inputType: "multiselect-checkboxes"
                            },
                            required: false,
                            readOnly: false
                        } satisfies Attribute
                    }
                },
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
                },
                profile: {
                    attributesByName: {
                        username: undefined
                    }
                }
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

export const WithTermsAcceptance: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                termsAcceptanceRequired: true,
                "x-keycloakify": {
                    messages: {
                        termsText: "<a href='https://example.com/terms'>Service Terms of Use</a>"
                    }
                }
            }}
        />
    )
};
