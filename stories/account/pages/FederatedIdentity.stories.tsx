import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../createPageStory";

const pageId = "federatedIdentity.ftl";

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

export const NotConnected: Story = {
    render: () => (
        <PageStory
            kcContext={{
                pageId: "federatedIdentity.ftl",
                federatedIdentity: {
                    identities: [
                        {
                            providerId: "google",
                            displayName: "keycloak-oidc",
                            connected: false
                        }
                    ],
                    removeLinkPossible: true
                }
            }}
        />
    )
};
