import { createGetKcContext } from "../../dist/account";

export const { getKcContext } = createGetKcContext();

const { kcContext } = getKcContext();

export type KcContext = NonNullable<typeof kcContext>;
