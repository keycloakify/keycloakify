import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "login-config-totp.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<any> = {
    title: `login/${pageId}`,
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

export const WithManualSetUp = () => (
    <PageStory
        kcContext={{
            mode: "manual"
        }}
    />
);

export const WithError = () => (
    <PageStory
        kcContext={{
            messagesPerField: {
                get: (fieldName: string) => (fieldName === "totp" ? "Invalid TOTP" : undefined),
                exists: (fieldName: string) => fieldName === "totp",
                existsError: (fieldName: string) => fieldName === "totp",
                printIfExists: <T,>(fieldName: string, x: T) => (fieldName === "totp" ? x : undefined)
            }
        }}
    />
);
