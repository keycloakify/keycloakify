import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login.ftl" });

const meta = {
    title: "login/login.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInvalidCredential: Story = {
    args: {
        kcContext: {
            login: {
                username: "johndoe"
            },
            messagesPerField: {
                // NOTE: The other functions of messagesPerField are derived from get() and
                // existsError() so they are the only ones that need to mock.
                existsError: (fieldName: string, ...otherFieldNames: string[]) => {
                    const fieldNames = [fieldName, ...otherFieldNames];
                    return fieldNames.includes("username") || fieldNames.includes("password");
                },
                get: (fieldName: string) => {
                    if (fieldName === "username" || fieldName === "password") {
                        return "Invalid username or password.";
                    }
                    return "";
                }
            }
        }
    }
};

export const WithoutRegistration: Story = {
    args: {
        kcContext: {
            realm: { registrationAllowed: false }
        }
    }
};

export const WithoutRememberMe: Story = {
    args: {
        kcContext: {
            realm: { rememberMe: false }
        }
    }
};

export const WithoutPasswordReset: Story = {
    args: {
        kcContext: {
            realm: { resetPasswordAllowed: false }
        }
    }
};

export const WithEmailAsUsername: Story = {
    args: {
        kcContext: {
            realm: { loginWithEmailAllowed: false }
        }
    }
};

export const WithPresetUsername: Story = {
    args: {
        kcContext: {
            login: { username: "max.mustermann@mail.com" }
        }
    }
};

export const WithImmutablePresetUsername: Story = {
    args: {
        kcContext: {
            auth: {
                attemptedUsername: "max.mustermann@mail.com",
                showUsername: true
            },
            usernameHidden: true,
            message: {
                type: "info",
                summary: "Please re-authenticate to continue"
            }
        }
    }
};

export const WithSocialProviders: Story = {
    args: {
        kcContext: {
            social: {
                displayInfo: true,
                providers: [
                    {
                        loginUrl: "google",
                        alias: "google",
                        providerId: "google",
                        displayName: "Google",
                        iconClasses: "fa fa-google"
                    },
                    {
                        loginUrl: "microsoft",
                        alias: "microsoft",
                        providerId: "microsoft",
                        displayName: "Microsoft",
                        iconClasses: "fa fa-windows"
                    },
                    {
                        loginUrl: "facebook",
                        alias: "facebook",
                        providerId: "facebook",
                        displayName: "Facebook",
                        iconClasses: "fa fa-facebook"
                    },
                    {
                        loginUrl: "instagram",
                        alias: "instagram",
                        providerId: "instagram",
                        displayName: "Instagram",
                        iconClasses: "fa fa-instagram"
                    },
                    {
                        loginUrl: "twitter",
                        alias: "twitter",
                        providerId: "twitter",
                        displayName: "Twitter",
                        iconClasses: "fa fa-twitter"
                    },
                    {
                        loginUrl: "linkedin",
                        alias: "linkedin",
                        providerId: "linkedin",
                        displayName: "LinkedIn",
                        iconClasses: "fa fa-linkedin"
                    },
                    {
                        loginUrl: "stackoverflow",
                        alias: "stackoverflow",
                        providerId: "stackoverflow",
                        displayName: "Stackoverflow",
                        iconClasses: "fa fa-stack-overflow"
                    },
                    {
                        loginUrl: "github",
                        alias: "github",
                        providerId: "github",
                        displayName: "Github",
                        iconClasses: "fa fa-github"
                    },
                    {
                        loginUrl: "gitlab",
                        alias: "gitlab",
                        providerId: "gitlab",
                        displayName: "Gitlab",
                        iconClasses: "fa fa-gitlab"
                    },
                    {
                        loginUrl: "bitbucket",
                        alias: "bitbucket",
                        providerId: "bitbucket",
                        displayName: "Bitbucket",
                        iconClasses: "fa fa-bitbucket"
                    },
                    {
                        loginUrl: "paypal",
                        alias: "paypal",
                        providerId: "paypal",
                        displayName: "PayPal",
                        iconClasses: "fa fa-paypal"
                    },
                    {
                        loginUrl: "openshift",
                        alias: "openshift",
                        providerId: "openshift",
                        displayName: "OpenShift",
                        iconClasses: "fa fa-cloud"
                    }
                ]
            }
        }
    }
};

export const WithoutPasswordField: Story = {
    args: {
        kcContext: {
            realm: { password: false }
        }
    }
};

export const WithErrorMessage: Story = {
    args: {
        kcContext: {
            message: {
                summary: "The time allotted for the connection has elapsed.<br/>The login process will restart from the beginning.",
                type: "error"
            }
        }
    }
};

export const WithOneSocialProvider: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        }
                    ]
                }
            }}
        />
    )
};

export const WithTwoSocialProviders: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        },
                        {
                            loginUrl: "microsoft",
                            alias: "microsoft",
                            providerId: "microsoft",
                            displayName: "Microsoft",
                            iconClasses: "fa fa-windows"
                        }
                    ]
                }
            }}
        />
    )
};
export const WithNoSocialProviders: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                social: {
                    displayInfo: true,
                    providers: []
                }
            }}
        />
    )
};
export const WithMoreThanTwoSocialProviders: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        },
                        {
                            loginUrl: "microsoft",
                            alias: "microsoft",
                            providerId: "microsoft",
                            displayName: "Microsoft",
                            iconClasses: "fa fa-windows"
                        },
                        {
                            loginUrl: "facebook",
                            alias: "facebook",
                            providerId: "facebook",
                            displayName: "Facebook",
                            iconClasses: "fa fa-facebook"
                        },
                        {
                            loginUrl: "twitter",
                            alias: "twitter",
                            providerId: "twitter",
                            displayName: "Twitter",
                            iconClasses: "fa fa-twitter"
                        }
                    ]
                }
            }}
        />
    )
};
export const WithSocialProvidersAndWithoutRememberMe: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                social: {
                    displayInfo: true,
                    providers: [
                        {
                            loginUrl: "google",
                            alias: "google",
                            providerId: "google",
                            displayName: "Google",
                            iconClasses: "fa fa-google"
                        }
                    ]
                },
                realm: { rememberMe: false }
            }}
        />
    )
};
