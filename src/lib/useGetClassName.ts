import { clsx } from "keycloakify/tools/clsx";
import { useConstCallback } from "keycloakify/tools/useConstCallback";

export function createUseClassName<ClassKey extends string>(params: {
    defaultClasses: Record<ClassKey, string | undefined>;
}) {
    const { defaultClasses } = params;

    function useGetClassName(params: {
        doUseDefaultCss: boolean;
        classes: Partial<Record<ClassKey, string>> | undefined;
    }) {
        const { classes, doUseDefaultCss } = params;

        const getClassName = useConstCallback((classKey: ClassKey): string => {
            return clsx(
                classKey,
                doUseDefaultCss ? defaultClasses[classKey] : undefined,
                classes?.[classKey]
            );
        });

        return { getClassName };
    }

    return { useGetClassName };
}
