import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../PageStory";

const pageId = "account.ftl";

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
