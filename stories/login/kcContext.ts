import { createGetKcContext } from "../../dist/login";

export const { getKcContext } = createGetKcContext();

const { kcContext } = getKcContext();

export type KcContext = NonNullable<typeof kcContext>;
