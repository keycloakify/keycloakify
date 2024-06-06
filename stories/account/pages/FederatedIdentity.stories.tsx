import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../PageStory";

const { PageStory } = createPageStory({ pageId: "federatedIdentity.ftl" });

const meta = {
    title: "account/federatedIdentity.ftl",
    component: PageStory
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
