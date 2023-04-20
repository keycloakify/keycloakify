import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "account.ftl";

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
