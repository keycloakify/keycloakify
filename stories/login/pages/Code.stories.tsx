import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "code.ftl" });

const meta = {
    title: "login/code.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithErrorCode: Story = {
    args: {
        kcContext: {
            code: {
                success: false,
                error: "Failed to generate code"
            }
        }
    }
};
export const WithFrenchLanguage: Story = {
    args: {
        kcContext: {
            locale: {
                currentLanguageTag: "fr"
            },
            code: {
                success: true,
                code: "XYZ789"
            }
        }
    }
};
export const WithHtmlErrorMessage: Story = {
    args: {
        kcContext: {
            code: {
                success: false,
                error: "Something went wrong. <a href='https://example.com'>Try again</a>"
            }
        }
    }
};
