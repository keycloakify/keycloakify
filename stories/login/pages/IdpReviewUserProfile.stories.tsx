import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "idp-review-user-profile.ftl" });

const meta = {
    title: "login/idp-review-user-profile.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};
export const WithFormValidationErrors: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                messagesPerField: {
                    existsError: (fieldName: string) => ["email", "firstName"].includes(fieldName),
                    get: (fieldName: string) => {
                        if (fieldName === "email") return "Invalid email format.";
                        if (fieldName === "firstName") return "First name is required.";
                    }
                }
            }}
        />
    )
};
export const WithReadOnlyFields: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        email: { value: "jane.doe@example.com", readOnly: true },
                        firstName: { value: "Jane", readOnly: false }
                    }
                }
            }}
        />
    )
};
export const WithPrefilledFormFields: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        firstName: { value: "Jane" },
                        lastName: { value: "Doe" },
                        email: { value: "jane.doe@example.com" }
                    }
                }
            }}
        />
    )
};
