import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../createPageStory";

const pageId = "error.ftl";

const { PageStory } = createPageStory({ pageId });

const meta = {
    title: `login/${pageId}`,
    component: PageStory,
    parameters
} satisfies Meta<typeof PageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <PageStory />
};

export const WithAnotherMessage: Story = {
    render: () => (
        <PageStory
            kcContext={{
                message: { summary: "With another error message" }
            }}
        />
    )
};
