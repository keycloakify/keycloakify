import "keycloakify/tools/Array.prototype.every";
import { useMemo, useReducer, Fragment, type Dispatch } from "react";
import { id } from "tsafe/id";
import type { MessageKey } from "keycloakify/login/i18n/i18n";
import type { Attribute, Validators } from "keycloakify/login/kcContext/KcContext";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import { emailRegexp } from "keycloakify/tools/emailRegExp";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import type { Param0 } from "tsafe";
import { assert, type Equals } from "tsafe/assert";

export type FormFieldError = {
    errorMessage: JSX.Element;
    errorMessageStr: string;
    validatorName: keyof Validators | undefined;
};

export type FormFieldState = {
    name: string;
    /** The index is always 0 for non multi-valued fields */
    index: number;
    value: string;
    displayableError: FormFieldError[];
};

export type FormState = {
    isFormSubmittable: boolean;
    formFieldStates: FormFieldState[];
};

export type FormAction =
    | {
          action: "update value";
          name: string;
          index: number;
          newValue: string;
      }
    | {
          action: "focus lost";
          name: string;
          index: number;
      }
    | {
          action: "add value to multi-valued attribute";
          name: string;
      };

export type ParamsOfUseFromValidation = {
    kcContext: {
        messagesPerField: Pick<KcContext.Common["messagesPerField"], "existsError" | "get">;
        profile: {
            attributes: Attribute[];
        };
        passwordRequired?: boolean;
        realm: { registrationEmailAsUsername: boolean };
    };
    passwordValidators?: Validators;
    requirePasswordConfirmation?: boolean;
    i18n: I18n;
};

export type ReturnTypeOfUseFormValidation = {
    formState: FormState;
    dispatchFormAction: Dispatch<FormAction>;
    attributesWithPassword: Attribute[];
};

/**
 * NOTE: The attributesWithPassword returned is actually augmented with
 * artificial password related attributes only if kcContext.passwordRequired === true
 */
export function useFormValidation(params: ParamsOfUseFromValidation): ReturnTypeOfUseFormValidation {
    const { kcContext, passwordValidators = {}, requirePasswordConfirmation = true, i18n } = params;

    const attributesWithPassword = useMemo(() => {
        const attributesWithPassword: Attribute[] = [];

        for (const attribute of kcContext.profile.attributes) {
            attributesWithPassword.push(attribute);

            add_password_and_password_confirm: {
                if (attribute.name !== (kcContext.realm.registrationEmailAsUsername ? "email" : "username")) {
                    // NOTE: We want to add password and password-confirm after the field that identifies the user.
                    // It's either email or username.
                    break add_password_and_password_confirm;
                }

                attributesWithPassword.push(
                    {
                        "name": "password",
                        "displayName": id<`\${${MessageKey}}`>("${password}"),
                        "required": true,
                        "readOnly": false,
                        "validators": passwordValidators,
                        "annotations": {},
                        "autocomplete": "new-password",
                        "html5DataAnnotations": {},
                        // NOTE: Compat with Keycloak version prior to 24
                        ...({ "groupAnnotations": {} } as {})
                    },
                    {
                        "name": "password-confirm",
                        "displayName": id<`\${${MessageKey}}`>("${passwordConfirm}"),
                        "required": true,
                        "readOnly": false,
                        "validators": {
                            "_compareToOther": {
                                "name": "password",
                                "ignore.empty.value": true,
                                "shouldBe": "equal",
                                "error-message": id<`\${${MessageKey}}`>("${invalidPasswordConfirmMessage}")
                            }
                        },
                        "annotations": {},
                        "html5DataAnnotations": {},
                        "autocomplete": "new-password",
                        "hidden": !requirePasswordConfirmation,
                        // NOTE: Compat with Keycloak version prior to 24
                        ...({ "groupAnnotations": {} } as {})
                    }
                );
            }
        }

        return attributesWithPassword;
    }, []);

    const { getErrors } = useGetErrors({
        kcContext,
        "attributes": attributesWithPassword,
        i18n
    });

    type FormFieldState_internal = Omit<FormFieldState, "displayableError"> & {
        errors: FormFieldError[];
        hasLostFocusAtLeastOnce: boolean;
    };

    type State = FormFieldState_internal[];

    const [state, dispatchFormAction] = useReducer(
        (state: State, params: FormAction): State => {
            if (params.action === "add value to multi-valued attribute") {
                const formFieldStates = state.filter(({ name }) => name === params.name);

                state.splice(state.indexOf(formFieldStates[formFieldStates.length - 1]) + 1, 0, {
                    "index": formFieldStates.length,
                    "name": params.name,
                    "value": "",
                    "errors": getErrors({
                        "name": params.name,
                        "index": formFieldStates.length,
                        "fieldValues": state
                    }),
                    "hasLostFocusAtLeastOnce": false
                });

                return state;
            }

            const formFieldState = state.find(({ name, index }) => name === params.name && index === params.index);

            assert(formFieldState !== undefined);

            switch (params.action) {
                case "focus lost":
                    formFieldState.hasLostFocusAtLeastOnce = true;
                    return state;
                case "update value":
                    formFieldState.value = params.newValue;
                    formFieldState.errors = getErrors({
                        "name": params.name,
                        "index": params.index,
                        "fieldValues": state
                    });
                    return state;
            }

            assert<Equals<typeof params, never>>(false);
        },
        useMemo(function getInitialState(): State {
            const initialFormFieldValues = (() => {
                const initialFormFieldValues: Param0<typeof getErrors>["fieldValues"] = [];

                for (const attribute of attributesWithPassword) {
                    handle_multi_valued_attribute: {
                        if (!attribute.multivalued) {
                            break handle_multi_valued_attribute;
                        }

                        const values = attribute.values ?? [attribute.value ?? ""];

                        for (let index = 0; index < values.length; index++) {
                            initialFormFieldValues.push({
                                "name": attribute.name,
                                index,
                                "value": values[index]
                            });
                        }

                        continue;
                    }

                    initialFormFieldValues.push({
                        "name": attribute.name,
                        "index": 0,
                        "value": attribute.value ?? ""
                    });
                }

                return initialFormFieldValues;
            })();

            const initialState: State = initialFormFieldValues.map(({ name, index, value }) => ({
                name,
                index,
                value,
                "errors": getErrors({
                    "name": name,
                    index,
                    "fieldValues": initialFormFieldValues
                }),
                "hasLostFocusAtLeastOnce": false
            }));

            return initialState;
        }, [])
    );

    const formState: FormState = useMemo(
        () => ({
            "formFieldStates": state.map(({ name, index, value, errors, hasLostFocusAtLeastOnce }) => ({
                name,
                index,
                value,
                "displayableError": hasLostFocusAtLeastOnce ? errors : []
            })),
            "isFormSubmittable": state.every(({ errors }) => errors.length === 0)
        }),
        [state]
    );

    return {
        formState,
        dispatchFormAction,
        attributesWithPassword
    };
}

/** Expect to be used in a component wrapped within a <I18nProvider> */
function useGetErrors(params: {
    kcContext: {
        messagesPerField: Pick<KcContext.Common["messagesPerField"], "existsError" | "get">;
    };
    attributes: {
        name: string;
        validators: Validators;
        value?: string;
        values?: string[];
        required?: boolean;
    }[];
    i18n: I18n;
}) {
    const { kcContext, attributes, i18n } = params;

    const { messagesPerField } = kcContext;

    const { msg, msgStr, advancedMsg, advancedMsgStr } = i18n;

    const getErrors = useConstCallback(
        (params: { name: string; index: number; fieldValues: { name: string; index: number; value: string }[] }): FormFieldError[] => {
            const { name, index, fieldValues } = params;

            const value = (() => {
                const fieldValue = fieldValues.find(fieldValue => fieldValue.name === name && fieldValue.index === index);

                assert(fieldValue !== undefined);

                return fieldValue.value;
            })();

            const attribute = attributes.find(attribute => attribute.name === name);

            assert(attribute !== undefined);

            server_side_error: {
                const defaultValue = (attribute.values !== undefined ? attribute.values[index] : attribute.value) ?? "";

                if (defaultValue !== value) {
                    break server_side_error;
                }

                let doesErrorExist: boolean;

                try {
                    doesErrorExist = messagesPerField.existsError(name);
                } catch {
                    break server_side_error;
                }

                if (!doesErrorExist) {
                    break server_side_error;
                }

                const errorMessageStr = messagesPerField.get(name);

                return [
                    {
                        "validatorName": undefined,
                        errorMessageStr,
                        "errorMessage": <span key={0}>{errorMessageStr}</span>
                    }
                ];
            }

            const errors: FormFieldError[] = [];

            const { validators } = attribute;

            required_field: {
                if (!attribute.required) {
                    break required_field;
                }

                if (value !== "") {
                    break required_field;
                }

                const msgArgs = ["error-user-attribute-required"] as const;

                errors.push({
                    "validatorName": undefined,
                    "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs)
                });
            }

            validator_x: {
                const validatorName = "length";

                const validator = validators[validatorName];

                if (validator === undefined) {
                    break validator_x;
                }

                const { "ignore.empty.value": ignoreEmptyValue = false, max, min } = validator;

                if (ignoreEmptyValue && value === "") {
                    break validator_x;
                }

                if (max !== undefined && value.length > parseInt(max)) {
                    const msgArgs = ["error-invalid-length-too-long", max] as const;

                    errors.push({
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        validatorName
                    });
                }

                if (min !== undefined && value.length < parseInt(min)) {
                    const msgArgs = ["error-invalid-length-too-short", min] as const;

                    errors.push({
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        validatorName
                    });
                }
            }

            validator_x: {
                const validatorName = "_compareToOther";

                const validator = validators[validatorName];

                if (validator === undefined) {
                    break validator_x;
                }

                const { "ignore.empty.value": ignoreEmptyValue = false, name: otherName, shouldBe, "error-message": errorMessageKey } = validator;

                if (ignoreEmptyValue && value === "") {
                    break validator_x;
                }

                const otherFieldValue = fieldValues.find(fieldValue => fieldValue.name === otherName);

                assert(otherFieldValue !== undefined);

                const isValid = (() => {
                    switch (shouldBe) {
                        case "different":
                            return otherFieldValue.value !== value;
                        case "equal":
                            return otherFieldValue.value === value;
                    }
                })();

                if (isValid) {
                    break validator_x;
                }

                const msgArg = [
                    errorMessageKey ??
                        id<MessageKey>(
                            (() => {
                                switch (shouldBe) {
                                    case "equal":
                                        return "shouldBeEqual";
                                    case "different":
                                        return "shouldBeDifferent";
                                }
                            })()
                        ),
                    otherName,
                    name,
                    shouldBe
                ] as const;

                errors.push({
                    validatorName,
                    "errorMessage": <Fragment key={errors.length}>{advancedMsg(...msgArg)}</Fragment>,
                    "errorMessageStr": advancedMsgStr(...msgArg)
                });
            }

            validator_x: {
                const validatorName = "pattern";

                const validator = validators[validatorName];

                if (validator === undefined) {
                    break validator_x;
                }

                const { "ignore.empty.value": ignoreEmptyValue = false, pattern, "error-message": errorMessageKey } = validator;

                if (ignoreEmptyValue && value === "") {
                    break validator_x;
                }

                if (new RegExp(pattern).test(value)) {
                    break validator_x;
                }

                const msgArgs = [errorMessageKey ?? id<MessageKey>("shouldMatchPattern"), pattern] as const;

                errors.push({
                    validatorName,
                    "errorMessage": <Fragment key={errors.length}>{advancedMsg(...msgArgs)}</Fragment>,
                    "errorMessageStr": advancedMsgStr(...msgArgs)
                });
            }

            validator_x: {
                if ([...errors].reverse()[0]?.validatorName === "pattern") {
                    break validator_x;
                }

                const validatorName = "email";

                const validator = validators[validatorName];

                if (validator === undefined) {
                    break validator_x;
                }

                const { "ignore.empty.value": ignoreEmptyValue = false } = validator;

                if (ignoreEmptyValue && value === "") {
                    break validator_x;
                }

                if (emailRegexp.test(value)) {
                    break validator_x;
                }

                const msgArgs = [id<MessageKey>("invalidEmailMessage")] as const;

                errors.push({
                    validatorName,
                    "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs)
                });
            }

            validator_x: {
                const validatorName = "integer";

                const validator = validators[validatorName];

                if (validator === undefined) {
                    break validator_x;
                }

                const { "ignore.empty.value": ignoreEmptyValue = false, max, min } = validator;

                if (ignoreEmptyValue && value === "") {
                    break validator_x;
                }

                const intValue = parseInt(value);

                if (isNaN(intValue)) {
                    const msgArgs = ["mustBeAnInteger"] as const;

                    errors.push({
                        validatorName,
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
                    });

                    break validator_x;
                }

                if (max !== undefined && intValue > parseInt(max)) {
                    const msgArgs = ["error-number-out-of-range-too-big", max] as const;

                    errors.push({
                        validatorName,
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
                    });

                    break validator_x;
                }

                if (min !== undefined && intValue < parseInt(min)) {
                    const msgArgs = ["error-number-out-of-range-too-small", min] as const;

                    errors.push({
                        validatorName,
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
                    });

                    break validator_x;
                }
            }

            validator_x: {
                const validatorName = "options";

                const validator = validators[validatorName];

                if (validator === undefined) {
                    break validator_x;
                }

                if (value === "") {
                    break validator_x;
                }

                if (validator.options.indexOf(value) >= 0) {
                    break validator_x;
                }

                const msgArgs = [id<MessageKey>("notAValidOption")] as const;

                errors.push({
                    validatorName,
                    "errorMessage": <Fragment key={errors.length}>{advancedMsg(...msgArgs)}</Fragment>,
                    "errorMessageStr": advancedMsgStr(...msgArgs)
                });
            }

            //TODO: Implement missing validators.

            return errors;
        }
    );

    return { getErrors };
}
