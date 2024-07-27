import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "federatedIdentity.ftl" });

const meta = {
    title: "account/federatedIdentity.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

export const NotConnected: Story = {
    render: () => (
        <KcPageStory
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
