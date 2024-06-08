import { clsx } from "keycloakify/tools/clsx";
import type { Param0 } from "tsafe";

// NOTE: Note for people trying to implement Keycloakify in other frontend
// frameworks. This can be used outside of React, useGetClassName isn't actually a hook.

export function createUseClassName<ClassKey extends string>(params: {
    defaultClasses: Record<ClassKey, string | undefined>;
}) {
    const { defaultClasses } = params;

    function areSameParams(
        params1: Param0<typeof useGetClassName>,
        params2: Param0<typeof useGetClassName>
    ): boolean {
        if (params1.doUseDefaultCss !== params2.doUseDefaultCss) {
            return false;
        }

        if (params1.classes === params2.classes) {
            return true;
        }

        return JSON.stringify(params1.classes) === JSON.stringify(params2.classes);
    }

    let cache:
        | {
              params: Param0<typeof useGetClassName>;
              result: ReturnType<typeof useGetClassName>;
          }
        | undefined = undefined;

    function useGetClassName(params: {
        doUseDefaultCss: boolean;
        classes: Partial<Record<ClassKey, string>> | undefined;
    }): { getClassName: (classKey: ClassKey) => string } {
        // NOTE: We implement a cache here only so that getClassName can be stable across renders.
        // We don't want to use useConstCallback because we want this to be useable outside of React.
        use_cache: {
            if (cache === undefined) {
                break use_cache;
            }

            if (!areSameParams(cache.params, params)) {
                break use_cache;
            }

            return cache.result;
        }

        function getClassName(classKey: ClassKey): string {
            return clsx(
                classKey,
                params.doUseDefaultCss ? defaultClasses[classKey] : undefined,
                params.classes?.[classKey]
            );
        }

        cache = { params, result: { getClassName } };

        return { getClassName };
    }

    return { useGetClassName };
}
