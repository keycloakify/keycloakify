import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../PageStory";

const pageId = "password.ftl";

const { PageStory } = createPageStory({ pageId });

const meta = {
    title: `account/${pageId}`,
    component: PageStory,
    parameters
} satisfies Meta<typeof PageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <PageStory />
};

export const WithMessage: Story = {
    render: () => (
        <PageStory
            kcContext={{
                message: { type: "success", summary: "This is a test message" }
            }}
        />
    )
};
