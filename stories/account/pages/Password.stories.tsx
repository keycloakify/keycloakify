import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "password.ftl" });

const meta = {
    title: "account/password.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

export const WithMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: { type: "success", summary: "This is a test message" }
            }}
        />
    )
};
