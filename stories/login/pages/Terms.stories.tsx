import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../PageStory";

const { PageStory } = createPageStory({ pageId: "terms.ftl" });

const meta = {
    title: "login/terms.ftl",
    component: PageStory
} satisfies Meta<typeof PageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <PageStory />
};

export const French: Story = {
    render: () => (
        <PageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "fr"
                }
            }}
        />
    )
};

export const Spanish: Story = {
    render: () => (
        <PageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "es"
                }
            }}
        />
    )
};
