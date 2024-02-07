import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "sessions.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<any> = {
    title: `account/${pageId}`,
    component: PageStory,
    parameters: {
        viewMode: "story",
        previewTabs: {
            "storybook/docs/panel": {
                hidden: true
            }
        }
    }
};

export default meta;

export const Default = () => <PageStory />;

export const WithMessage = () => (
    <PageStory
        kcContext={{
            message: { type: "success", summary: "This is a test message" }
        }}
    />
);
