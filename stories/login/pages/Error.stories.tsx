import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "error.ftl" });

const meta = {
    title: "login/error.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

export const WithAnotherMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: { summary: "With another error message" }
            }}
        />
    )
};

export const WithHtmlErrorMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "<strong>Error:</strong> Something went wrong. <a href='https://example.com'>Go back</a>"
                }
            }}
        />
    )
};
export const FrenchError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: { currentLanguageTag: "fr" },
                message: { summary: "Une erreur s'est produite" }
            }}
        />
    )
};
export const WithSkipLink: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: { summary: "An error occurred" },
                skipLink: true,
                client: {
                    baseUrl: "https://example.com"
                }
            }}
        />
    )
};
