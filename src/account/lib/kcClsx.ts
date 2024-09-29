import { createGetKcClsx } from "keycloakify/lib/getKcClsx";

export type ClassKey =
    | "kcHtmlClass"
    | "kcBodyClass"
    | "kcButtonClass"
    | "kcButtonPrimaryClass"
    | "kcButtonLargeClass"
    | "kcButtonDefaultClass"
    | "kcContentWrapperClass"
    | "kcFormClass"
    | "kcFormGroupClass"
    | "kcInputWrapperClass"
    | "kcLabelClass"
    | "kcInputClass"
    | "kcInputErrorMessageClass";

export const { getKcClsx } = createGetKcClsx<ClassKey>({
    defaultClasses: {
        kcHtmlClass: undefined,
        kcBodyClass: undefined,
        kcButtonClass: "btn",
        kcContentWrapperClass: "row",
        kcButtonPrimaryClass: "btn-primary",
        kcButtonLargeClass: "btn-lg",
        kcButtonDefaultClass: "btn-default",
        kcFormClass: "form-horizontal",
        kcFormGroupClass: "form-group",
        kcInputWrapperClass: "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        kcLabelClass: "control-label",
        kcInputClass: "form-control",
        kcInputErrorMessageClass:
            "pf-c-form__helper-text pf-m-error required kc-feedback-text"
    }
});

export type KcClsx = ReturnType<typeof getKcClsx>["kcClsx"];
