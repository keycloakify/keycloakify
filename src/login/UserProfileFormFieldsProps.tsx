import type { JSX } from "keycloakify/tools/JSX";
import { type FormAction, type FormFieldError } from "keycloakify/login/lib/useUserProfileForm";
import type { KcClsx } from "keycloakify/login/lib/kcClsx";
import type { Attribute } from "keycloakify/login/KcContext";
import { Dispatch, SetStateAction } from "react";
import { UserProfileFormSubmit } from "./lib/getUserProfileApi";

export type UserProfileFormFieldsProps<KcContext = any, I18n = any> = {
    kcContext: Extract<KcContext, { profile: unknown }>;
    i18n: I18n;
    kcClsx: KcClsx;
    mode: FormSubmitMode;
    onFormData: Dispatch<
        SetStateAction<{
            mode: FormSubmitMode;
            isFormSubmittable: boolean;
            onFormSubmit: UserProfileFormSubmit | null;
        }>
    >;
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

type FormSubmitMode = "activeButton" | "disabledButton";
