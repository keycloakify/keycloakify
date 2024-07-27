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
