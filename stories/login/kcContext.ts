import { ExtendKcContext } from "../../dist/login";

export type KcContextExtraProperties = {};

export type KcContextExtraPropertiesPerPage = {};

export type KcContext = ExtendKcContext<
    KcContextExtraProperties,
    KcContextExtraPropertiesPerPage
>;
