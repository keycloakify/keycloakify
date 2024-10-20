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

/**
 * RemoveLinkNotPossible:
 * - Federated identities are connected, but the user cannot remove them due to restrictions.
 */
export const RemoveLinkNotPossible: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                pageId: "federatedIdentity.ftl",
                federatedIdentity: {
                    identities: [
                        {
                            providerId: "google",
                            displayName: "Google",
                            userName: "john.doe@gmail.com",
                            connected: true
                        }
                    ],
                    removeLinkPossible: false
                },
                stateChecker: "1234",
                url: {
                    socialUrl: "/social"
                }
            }}
        />
    )
};

/**
 * AddLinkForUnconnectedIdentity:
 * - The user has an identity that is not connected and can add it.
 */
export const AddLinkForUnconnectedIdentity: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                pageId: "federatedIdentity.ftl",
                federatedIdentity: {
                    identities: [
                        {
                            providerId: "github",
                            displayName: "GitHub",
                            userName: "",
                            connected: false
                        }
                    ],
                    removeLinkPossible: true
                },
                stateChecker: "1234",
                url: {
                    socialUrl: "/social"
                }
            }}
        />
    )
};
