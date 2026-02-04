import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-update-profile.ftl" });

const meta = {
    title: "login/login-update-profile.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

/**
 * WithProfileError:
 * - Purpose: Tests when an error occurs in one or more profile fields (e.g., invalid email format).
 * - Scenario: The component displays error messages next to the affected fields.
 * - Key Aspect: Ensures the profile fields show error messages when validation fails.
 */
export const WithProfileError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                url: {
                    loginAction: "/mock-login-action"
                },
                messagesPerField: {
                    existsError: (field: string) => field === "email",
                    get: () => "Invalid email format"
                },
                isAppInitiatedAction: false
            }}
        />
    )
};

export const WithMoreFields: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        multiAttribute: {
                            validators: {},
                            displayName: "Multi-Attribute Field",
                            annotations: {},
                            required: false,
                            multivalued: true,
                            readOnly: false,
                            name: "multiAttribute"
                        },
                        favouritePet: {
                            validators: {
                                options: {
                                    options: ["Cat", "Dog", "Bird"]
                                },
                                multivalued: {
                                    max: "1"
                                }
                            },
                            displayName: "Favourite Pet",
                            values: [],
                            annotations: {
                                inputType: "select"
                            },
                            required: false,
                            multivalued: false,
                            readOnly: false,
                            name: "favouritePet"
                        },
                        age: {
                            validators: {
                                multivalued: {
                                    max: "1"
                                },
                                integer: {
                                    min: 0,
                                    max: 99
                                }
                            },
                            displayName: "Age",
                            values: [],
                            annotations: {
                                inputType: "html5-number"
                            },
                            required: false,
                            multivalued: false,
                            readOnly: false,
                            name: "age"
                        },
                        birthdate: {
                            validators: {
                                multivalued: {
                                    max: 1
                                }
                            },
                            displayName: "Birthdate",
                            values: [],
                            annotations: {
                                inputType: "html5-date"
                            },
                            required: false,
                            multivalued: false,
                            readOnly: false,
                            name: "birthdate"
                        }
                    }
                }
            }}
        />
    )
};

export const WithGroups: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        division: {
                            validators: {},
                            displayName: "Division",
                            annotations: {},
                            required: false,
                            html5DataAnnotations: {},
                            group: {
                                displayDescription: "Attributes, which refer to user metadata",
                                annotations: {},
                                displayHeader: "User metadata",
                                html5DataAnnotations: {},
                                name: "user-metadata"
                            },
                            multivalued: false,
                            readOnly: false,
                            name: "divison"
                        }
                    }
                }
            }}
        />
    )
};
