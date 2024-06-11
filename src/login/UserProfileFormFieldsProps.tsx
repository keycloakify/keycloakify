import { type FormAction, type FormFieldError } from "keycloakify/login/lib/useUserProfileForm";
import type { KcClsx } from "keycloakify/login/lib/kcClsx";
import type { Attribute } from "keycloakify/login/KcContext";

export type UserProfileFormFieldsProps<KcContext, I18n> = {
    kcContext: Extract<KcContext, { profile: unknown }>;
    i18n: I18n;
    kcClsx: KcClsx;
    onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
    doMakeUserConfirmPassword: boolean;
    BeforeField?: (props: BeforeAfterFieldProps<I18n>) => JSX.Element | null;
    AfterField?: (props: BeforeAfterFieldProps<I18n>) => JSX.Element | null;
};

type BeforeAfterFieldProps<I18n> = {
    attribute: Attribute;
    dispatchFormAction: React.Dispatch<FormAction>;
    displayableErrors: FormFieldError[];
    valueOrValues: string | string[];
    kcClsx: KcClsx;
    i18n: I18n;
};
