import React from "react";
import { Meta } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "federatedIdentity.ftl";

const { PageStory } = createPageStory({ pageId });

const meta = {
    title: "account/FederatedIdentity",
    component: PageStory
} satisfies Meta<typeof PageStory>;

export default meta;

export const Default = () => <PageStory />;

export const NotConnected = () => (
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
);
