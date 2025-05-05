import type { JSXElement } from "keycloakify/tools/JSX";
import * as reactlessApi from "./getUserProfileApi/index";
import type { PasswordPolicies, Attribute, Validators } from "keycloakify/login/KcContext";
import { useEffect, useState, useMemo, Fragment } from "react";
import { assert, type Equals } from "tsafe/assert";
import type { I18n } from "../i18n";
export { getButtonToDisplayForMultivaluedAttributeField } from "./getUserProfileApi/index";

export type FormFieldError = {
    errorMessage: JSXElement;
    errorMessageStr: string;
    source: FormFieldError.Source;
    fieldIndex: number | undefined;
};

{
    type A = Omit<FormFieldError, "errorMessage" | "errorMessageStr">;
    type B = Omit<reactlessApi.FormFieldError, "advancedMsgArgs">;

    assert<Equals<A, B>>();
}

export namespace FormFieldError {
    export type Source = Source.Validator | Source.PasswordPolicy | Source.Server | Source.Other;

    export namespace Source {
        export type Validator = {
            type: "validator";
            name: keyof Validators;
        };
        export type PasswordPolicy = {
            type: "passwordPolicy";
            name: keyof PasswordPolicies;
        };
        export type Server = {
            type: "server";
        };

        export type Other = {
            type: "other";
            rule: "passwordConfirmMatchesPassword" | "requiredField";
        };
    }
}

{
    type A = FormFieldError.Source;
    type B = reactlessApi.FormFieldError.Source;

    assert<Equals<A, B>>();
}

export type FormFieldState = {
    attribute: Attribute;
    displayableErrors: FormFieldError[];
    valueOrValues: string | string[];
};

{
    type A = Omit<FormFieldState, "displayableErrors">;
    type B = Omit<reactlessApi.FormFieldState, "displayableErrors">;

    assert<Equals<A, B>>();
}

export type FormState = {
    isFormSubmittable: boolean;
    formFieldStates: FormFieldState[];
};

{
    type A = Omit<FormState, "formFieldStates">;
    type B = Omit<FormState, "formFieldStates">;

    assert<Equals<A, B>>();
}

export type FormAction =
    | {
          action: "update";
          name: string;
          valueOrValues: string | string[];
          /** Default false */
          displayErrorsImmediately?: boolean;
      }
    | {
          action: "focus lost";
          name: string;
          fieldIndex: number | undefined;
      };

{
    type A = FormAction;
    type B = reactlessApi.FormAction;

    assert<Equals<A, B>>();
}

export type KcContextLike = reactlessApi.KcContextLike;

export type I18nLike = Pick<I18n, "advancedMsg" | "advancedMsgStr">;

export type ParamsOfUseUserProfileForm = {
    kcContext: KcContextLike;
    doMakeUserConfirmPassword: boolean;
    i18n: I18nLike;
};

{
    type A = Omit<ParamsOfUseUserProfileForm, "i18n">;
    type B = reactlessApi.ParamsOfGetUserProfileApi;

    assert<Equals<A, B>>();
}

export type ReturnTypeOfUseUserProfileForm = {
    formState: FormState;
    dispatchFormAction: (action: FormAction) => void;
};

export function useUserProfileForm(params: ParamsOfUseUserProfileForm): ReturnTypeOfUseUserProfileForm {
    const { doMakeUserConfirmPassword, i18n, kcContext } = params;

    const api = reactlessApi.getUserProfileApi({
        kcContext,
        doMakeUserConfirmPassword
    });

    const [formState_reactless, setFormState_reactless] = useState(() => api.getFormState());

    useEffect(() => {
        const { unsubscribe } = api.subscribeToFormState(() => {
            setFormState_reactless(api.getFormState());
        });

        return () => unsubscribe();
    }, [api]);

    const { advancedMsg, advancedMsgStr } = i18n;

    const formState = useMemo(
        (): FormState => ({
            isFormSubmittable: formState_reactless.isFormSubmittable,
            formFieldStates: formState_reactless.formFieldStates.map(formFieldState_reactless => ({
                attribute: formFieldState_reactless.attribute,
                valueOrValues: formFieldState_reactless.valueOrValues,
                displayableErrors: formFieldState_reactless.displayableErrors.map((formFieldError_reactless, i) => ({
                    errorMessage: (
                        <Fragment key={`${formFieldState_reactless.attribute.name}-${i}`}>
                            {advancedMsg(...formFieldError_reactless.advancedMsgArgs)}
                        </Fragment>
                    ),
                    errorMessageStr: advancedMsgStr(...formFieldError_reactless.advancedMsgArgs),
                    source: formFieldError_reactless.source,
                    fieldIndex: formFieldError_reactless.fieldIndex
                }))
            }))
        }),
        [formState_reactless]
    );

    return {
        formState,
        dispatchFormAction: api.dispatchFormAction
    };
}
