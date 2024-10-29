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
    args: {
        kcContext: {
            message: {
                summary: "Server info message"
            }
        }
    }
};

export const WithLinkBack: Story = {
    args: {
        kcContext: {
            message: {
                summary: "Server message"
            },
            actionUri: undefined
        }
    }
};

export const WithRequiredActions: Story = {
    args: {
        kcContext: {
            message: {
                summary: "Required actions: "
            },
            requiredActions: ["CONFIGURE_TOTP", "UPDATE_PROFILE", "VERIFY_EMAIL", "CUSTOM_ACTION"],
            "x-keycloakify": {
                messages: {
                    "requiredAction.CUSTOM_ACTION": "Custom action"
                }
            }
        }
    }
};
export const WithPageRedirect: Story = {
    args: {
        kcContext: {
            message: { summary: "You will be redirected shortly." },
            pageRedirectUri: "https://example.com"
        }
    }
};
export const WithoutClientBaseUrl: Story = {
    args: {
        kcContext: {
            message: { summary: "No client base URL defined." },
            client: { baseUrl: undefined }
        }
    }
};
export const WithMessageHeader: Story = {
    args: {
        kcContext: {
            messageHeader: "Important Notice",
            message: { summary: "This is an important message." }
        }
    }
};
export const WithAdvancedMessage: Story = {
    args: {
        kcContext: {
            message: { summary: "Please take note of this <strong>important</strong> information." }
        }
    }
};
