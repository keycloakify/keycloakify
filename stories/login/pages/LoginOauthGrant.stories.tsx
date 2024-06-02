import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory, parameters } from "../createPageStory";

const pageId = "login-oauth-grant.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<any> = {
    title: `login/${pageId}`,
    component: PageStory,
    parameters
};

export default meta;

export const Default = () => <PageStory />;
