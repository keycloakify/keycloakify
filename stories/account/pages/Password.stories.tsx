import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../PageStory";

const { PageStory } = createPageStory({ pageId: "password.ftl" });

const meta = {
    title: "account/password.ftl",
    component: PageStory
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
