import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "applications.ftl" });

const meta = {
    title: "account/applications.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                pageId: "applications.ftl",
                applications: {
                    applications: [
                        {
                            realmRolesAvailable: [
                                {
                                    name: "realmRoleName1",
                                    description: "realm role description 1"
                                },
                                {
                                    name: "realmRoleName2",
                                    description: "realm role description 2"
                                }
                            ],
                            resourceRolesAvailable: {
                                resource1: [
                                    {
                                        roleName: "Resource Role Name 1",
                                        roleDescription: "Resource role 1 description",
                                        clientName: "Client Name 1",
                                        clientId: "client1"
                                    }
                                ],
                                resource2: [
                                    {
                                        roleName: "Resource Role Name 2",
                                        clientName: "Client Name 1",
                                        clientId: "client1"
                                    }
                                ]
                            },
                            additionalGrants: ["grant1", "grant2"],
                            clientScopesGranted: ["scope1", "scope2"],
                            effectiveUrl: "#",
                            client: {
                                clientId: "application1",
                                name: "Application 1",
                                consentRequired: true
                            }
                        },
                        {
                            realmRolesAvailable: [
                                {
                                    name: "Realm Role Name 1"
                                }
                            ],
                            resourceRolesAvailable: {},
                            additionalGrants: [],
                            clientScopesGranted: [],
                            effectiveUrl: "#",
                            client: {
                                clientId: "application2",
                                name: "Application 2"
                            }
                        }
                    ]
                }
            }}
        />
    )
};
