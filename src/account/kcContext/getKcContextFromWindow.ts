import type { AndByDiscriminatingKey } from "keycloakify/tools/AndByDiscriminatingKey";
import { ftlValuesGlobalName } from "keycloakify/bin/keycloakify/ftlValuesGlobalName";
import type { KcContext } from "./KcContext";

export type ExtendKcContext<KcContextExtension extends { pageId: string }> = [KcContextExtension] extends [never]
    ? KcContext
    : AndByDiscriminatingKey<"pageId", KcContextExtension & KcContext.Common, KcContext>;

export function getKcContextFromWindow<KcContextExtension extends { pageId: string } = never>(): ExtendKcContext<KcContextExtension> | undefined {
    return typeof window === "undefined" ? undefined : (window as any)[ftlValuesGlobalName];
}
