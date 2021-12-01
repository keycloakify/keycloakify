import type { DeepPartial } from "../tools/DeepPartial";
import type { ExtendsKcContextBase } from "./getKcContextFromWindow";
export declare function getKcContext<
    KcContextExtended extends {
        pageId: string;
    } = never,
>(params?: {
    mockPageId?: ExtendsKcContextBase<KcContextExtended>["pageId"];
    mockData?: readonly DeepPartial<ExtendsKcContextBase<KcContextExtended>>[];
}): {
    kcContext: ExtendsKcContextBase<KcContextExtended> | undefined;
};
