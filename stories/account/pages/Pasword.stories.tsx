import React from "react";
import { Meta } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "password.ftl";

const { PageStory } = createPageStory({ pageId });

const meta = {
    title: "account/Password",
    component: PageStory
} satisfies Meta<typeof PageStory>;

export default meta;

export const Default = () => <PageStory />;

export const WithMessage = () => (
    <PageStory
        kcContext={{
            message: { type: "success", summary: "This is a test message" }
        }}
    />
);
