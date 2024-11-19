import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "info.ftl" });

const meta = {
    title: "login/info.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                messageHeader: "Message header",
                message: {
                    summary: "Server info message"
                }
            }}
        />
    )
};

export const WithLinkBack: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                messageHeader: "Message header",
                message: {
                    summary: "Server message"
                },
                actionUri: undefined
            }}
        />
    )
};

export const WithRequiredActions: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                messageHeader: "Message header",
                message: {
                    summary: "Required actions: "
                },
                requiredActions: ["CONFIGURE_TOTP", "UPDATE_PROFILE", "VERIFY_EMAIL", "CUSTOM_ACTION"],
                "x-keycloakify": {
                    messages: {
                        "requiredAction.CUSTOM_ACTION": "Custom action"
                    }
                }
            }}
        />
    )
};
