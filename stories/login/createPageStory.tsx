import React from "react";
import { getKcContext, type KcContext } from "./kcContext";
import KcApp from "./KcApp";
import type { DeepPartial } from "../../dist/tools/DeepPartial";

export function createPageStory<PageId extends KcContext["pageId"]>(params: { pageId: PageId }) {
    const { pageId } = params;

    function PageStory(params: { kcContext?: DeepPartial<Extract<KcContext, { pageId: PageId }>> }) {
        const { kcContext } = getKcContext({
            mockPageId: pageId,
            storyPartialKcContext: params.kcContext
        });

        return <KcApp kcContext={kcContext} />;
    }

    return { PageStory };
}
