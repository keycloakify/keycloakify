import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "account.ftl";

const { PageStory } = createPageStory({ pageId });

const meta = {
    title: "account/Account",
    component: PageStory
} satisfies Meta<typeof PageStory>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <PageStory />
};
