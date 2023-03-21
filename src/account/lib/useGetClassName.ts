import { createUseClassName } from "keycloakify/lib/useGetClassName";
import type { ClassKey } from "keycloakify/account/TemplateProps";

export const { useGetClassName } = createUseClassName<ClassKey>({
    "defaultClasses": {
        "kcBodyClass": undefined,
        "kcButtonClass": "btn",
        "kcButtonPrimaryClass": "btn-primary",
        "kcButtonLargeClass": "btn-lg",
        "kcButtonDefaultClass": "btn-default"
    }
});
