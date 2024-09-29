import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "terms.ftl" });

const meta = {
    title: "login/terms.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                "x-keycloakify": {
                    messages: {
                        termsText: "<p>My terms in <strong>English</strong></p>"
                    }
                }
            }}
        />
    )
};

export const French: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "fr"
                },
                "x-keycloakify": {
                    // cSpell: disable
                    messages: {
                        termsText: "<p>Mes terme en <strong>Français</strong></p>"
                    }
                    // cSpell: enable
                }
            }}
        />
    )
};
export const WithErrorMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                messagesPerField: {
                    existsError: () => true,
                    get: () => "An error occurred while processing your request."
                }
            }}
        />
    )
};

export const Spanish: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "es"
                },
                "x-keycloakify": {
                    messages: {
                        termsText: "<p>Mis términos en <strong>Español</strong></p>"
                    }
                }
            }}
        />
    )
};
