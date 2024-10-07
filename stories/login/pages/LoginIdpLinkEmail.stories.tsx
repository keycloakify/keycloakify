import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-idp-link-email.ftl" });

const meta = {
    title: "login/login-idp-link-email.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};
export const WithIdpAlias: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                idpAlias: "Google",
                brokerContext: {
                    username: "john.doe"
                },
                realm: {
                    displayName: "MyRealm"
                }
            }}
        />
    )
};
export const WithoutIdpAlias: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                idpAlias: undefined,
                brokerContext: {
                    username: "john.doe"
                },
                realm: {
                    displayName: "MyRealm"
                }
            }}
        />
    )
};

export const WithCustomRealmDisplayName: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                idpAlias: "Facebook",
                brokerContext: {
                    username: "jane.doe"
                },
                realm: {
                    displayName: "CustomRealm"
                }
            }}
        />
    )
};
