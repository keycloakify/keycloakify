import type { Param0 } from "tsafe";
import { type CxArg, clsx_withTransform } from "../tools/clsx_withTransform";
import { clsx } from "../tools/clsx";
import { assert, is } from "tsafe/assert";

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

        if (params1.classes === undefined || params2.classes === undefined) {
            return false;
        }

        if (Object.keys(params1.classes).length !== Object.keys(params2.classes).length) {
            return false;
        }

        for (const key in params1.classes) {
            if (params1.classes[key] !== params2.classes[key]) {
                return false;
            }
        }

        return true;
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
                        classes?.[classKey] ??
                            (doUseDefaultCss ? defaultClasses[classKey] : undefined)
                    );
                }
            });
        }

        cache = { params, result: { kcClsx } };

        return { kcClsx };
    }

    return { getKcClsx };
}
