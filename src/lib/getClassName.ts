import { clsx } from "keycloakify/tools/clsx";

export function useGetClassName<ClassKey extends string>(params: {
    defaultClasses?: Record<ClassKey, string | undefined>;
    classes?: Partial<Record<ClassKey, string>>;
}) {
    const { defaultClasses, classes } = params;

    const getClassName = (classKey: ClassKey): string => {
        return clsx(classKey, defaultClasses?.[classKey], classes?.[classKey]);
    };

    return { getClassName };
}
