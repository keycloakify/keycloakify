import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../createPageStory";

const pageId = "login-reset-password.ftl";

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

export const WithEmailAsUsername: Story = {
    render: () => (
        <PageStory
            kcContext={{
                realm: {
                    loginWithEmailAllowed: true,
                    registrationEmailAsUsername: true
                }
            }}
        />
    )
};
