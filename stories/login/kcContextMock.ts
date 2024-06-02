import { createGetKcContextMock } from "../../dist/login";
import { KcContextExtraProperties, KcContextExtraPropertiesPerPage } from "./kcContext";

const kcContextExtraProperties: KcContextExtraProperties = {};
const kcContextExtraPropertiesPerPage: KcContextExtraPropertiesPerPage = {};

export const { getKcContextMock } = createGetKcContextMock({
    kcContextExtraProperties,
    kcContextExtraPropertiesPerPage
});
