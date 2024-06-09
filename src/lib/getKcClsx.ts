import type { Param0 } from "tsafe";
import { type CxArg, clsx_withTransform } from "../tools/clsx_withTransform";
import { clsx } from "../tools/clsx";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";

export function createGetKcClsx<ClassKey extends string>(params: {
    defaultClasses: Record<ClassKey, string | undefined>;
}) {
    const { defaultClasses } = params;

    function areSameParams(
        params1: Param0<typeof getKcClsx>,
        params2: Param0<typeof getKcClsx>
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
              params: Param0<typeof getKcClsx>;
              result: ReturnType<typeof getKcClsx>;
          }
        | undefined = undefined;

    function getKcClsx(params: {
        doUseDefaultCss: boolean;
        classes: Partial<Record<ClassKey, string>> | undefined;
    }): { kcClsx: (...args: CxArg<ClassKey>[]) => string } {
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

        const { classes, doUseDefaultCss } = params;

        function kcClsx(...args: CxArg<ClassKey>[]): string {
            return clsx_withTransform({
                args,
                transform: classKey => {
                    assert(is<ClassKey>(classKey));

                    return clsx(
                        classKey,
                        doUseDefaultCss ? defaultClasses[classKey] : undefined,
                        classes?.[classKey]
                    );
                }
            });
        }

        cache = { params, result: { kcClsx } };

        return { kcClsx };
    }

    return { getKcClsx };
}
