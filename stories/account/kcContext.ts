import type { ExtendKcContext } from "../../dist/account";

export type KcContextExtraProperties = {};

export type KcContextExtraPropertiesPerPage = {};

export type KcContext = ExtendKcContext<
    KcContextExtraProperties,
    KcContextExtraPropertiesPerPage
>;
