import type { KcContextBase } from "./KcContextBase";
import type { AndByDiscriminatingKey } from "../tools/AndByDiscriminatingKey";
export declare type ExtendsKcContextBase<
    KcContextExtended extends {
        pageId: string;
    },
> = [KcContextExtended] extends [never] ? KcContextBase : AndByDiscriminatingKey<"pageId", KcContextExtended & KcContextBase.Common, KcContextBase>;
export declare function getKcContextFromWindow<
    KcContextExtended extends {
        pageId: string;
    } = never,
>(): ExtendsKcContextBase<KcContextExtended> | undefined;
