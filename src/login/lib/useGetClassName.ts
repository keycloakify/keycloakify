import { clsx } from "keycloakify/tools/clsx";
import { useConstCallback } from "keycloakify/tools/useConstCallback";

export function useGetClassName<ClassKey extends string>(params: {
    defaultClasses?: Record<ClassKey, string | undefined>;
    classes?: Partial<Record<ClassKey, string>>;
}) {
    const { defaultClasses, classes } = params;

    const getClassName = useConstCallback((classKey: ClassKey): string => {
        return clsx(classKey, defaultClasses?.[classKey], classes?.[classKey]);
    });

    return { getClassName };
}
