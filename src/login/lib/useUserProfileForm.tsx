import "keycloakify/tools/Array.prototype.every";
import { useMemo, useReducer, Fragment, type Dispatch } from "react";
import { id } from "tsafe/id";
import type { MessageKey } from "keycloakify/login/i18n/i18n";
import type { Attribute, Validators } from "keycloakify/login/kcContext/KcContext";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import { emailRegexp } from "keycloakify/tools/emailRegExp";
import type { KcContext, PasswordPolicies } from "keycloakify/login/kcContext/KcContext";
import { assert, type Equals } from "tsafe/assert";
import type { I18n } from "../i18n";

export type FormFieldError = {
    errorMessage: JSX.Element;
    errorMessageStr: string;
    // TODO: This is not enough, we should be able to tell
    // if it's a server side error, a validator error or a password policy error.
    validatorName: keyof Validators | undefined;
    fieldIndex: number | undefined;
};

export type FormFieldState = FormFieldState.Simple | FormFieldState.MultiValued;

export namespace FormFieldState {
    export type Common = {
        attribute: Attribute;
        displayableErrors: FormFieldError[];
    };

    export type Simple = Common & {
        value: string;
    };

    export type MultiValued = Common & {
        values: string[];
    };
}

export type FormState = {
    isFormSubmittable: boolean;
    formFieldStates: FormFieldState[];
};

export type FormAction =
    | {
          action: "update";
          name: string;
          value: string;
      }
    | {
          action: "update multi-valued";
          name: string;
          values: string[];
      }
    | {
          action: "focus lost";
          name: string;
      }
    | {
          action: "multi-valued text input focus lost";
          name: string;
          fieldIndex: number;
      };

export type KcContextLike = {
    messagesPerField: Pick<KcContext.Common["messagesPerField"], "existsError" | "get">;
    profile: {
        attributes: Attribute[];
    };
    passwordRequired?: boolean;
    realm: { registrationEmailAsUsername: boolean };
    passwordPolicies?: PasswordPolicies;
};

export type ParamsOfUseUserProfileForm = {
    kcContext: KcContextLike;
    i18n: I18n;
    doMakeUserConfirmPassword: boolean;
};

export type ReturnTypeOfUseUserProfileForm = {
    formState: FormState;
    dispatchFormAction: Dispatch<FormAction>;
};

namespace internal {
    export type FormFieldState = FormFieldState.Simple | FormFieldState.MultiValued;

    export namespace FormFieldState {
        export type Common = {
            attribute: Attribute;
            errors: FormFieldError[];
            hasLostFocusAtLeastOnce: boolean | boolean[];
        };

        export type Simple = Common & {
            value: string;
        };

        export type MultiValued = Common & {
            values: string[];
        };
    }

    export type State = {
        formFieldStates: FormFieldState[];
    };
}

/**
 * NOTE: The attributesWithPassword returned is actually augmented with
 * artificial password related attributes only if kcContext.passwordRequired === true
 */
export function useUserProfileForm(params: ParamsOfUseUserProfileForm): ReturnTypeOfUseUserProfileForm {
    const { kcContext, i18n, doMakeUserConfirmPassword } = params;

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
                        "validators": {},
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
                        "validators": {},
                        "annotations": {},
                        "html5DataAnnotations": {},
                        "autocomplete": "new-password",
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
        i18n
    });

    const [state, dispatchFormAction] = useReducer(
        function reducer(state: internal.State, params: FormAction): internal.State {
            if (params.action === "add value to multi-valued attribute") {
                const formFieldStates = state.formFieldStates.filter(({ name }) => name === params.name);

                state.formFieldStates.splice(state.formFieldStates.indexOf(formFieldStates[formFieldStates.length - 1]) + 1, 0, {
                    "index": formFieldStates.length,
                    "name": params.name,
                    "value": "",
                    "errors": getErrors({
                        "name": params.name,
                        "index": formFieldStates.length,
                        "fieldValues": state.formFieldStates
                    }),
                    "hasLostFocusAtLeastOnce": false,
                    "attribute": formFieldStates[0].attribute
                });

                return state;
            }

            const formFieldState = state.formFieldStates.find(({ name, index }) => name === params.name && index === params.index);

            assert(formFieldState !== undefined);

            switch (params.action) {
                case "focus lost":
                    formFieldState.hasLostFocusAtLeastOnce = true;
                    return state;
                case "update value":
                    update_password_confirm: {
                        if (params.name !== "password") {
                            break update_password_confirm;
                        }

                        if (doMakeUserConfirmPassword) {
                            break update_password_confirm;
                        }

                        state = reducer(state, {
                            "action": "update value",
                            "name": "password-confirm",
                            "index": 0,
                            "newValue": params.newValue
                        });
                    }

                    formFieldState.value = params.newValue;
                    formFieldState.errors = getErrors({
                        "name": params.name,
                        "index": params.index,
                        "fieldValues": state.formFieldStates
                    });
                    return state;
                case "remove value from multi-valued attribute":
                    state.formFieldStates.splice(state.formFieldStates.indexOf(formFieldState), 1);
                    return state;
            }

            assert<Equals<typeof params, never>>(false);
        },
        useMemo(function getInitialState(): internal.State {
            const initialFormFieldValues = (() => {
                const initialFormFieldValues: ({ attribute: Attribute } & ({ value: string } | { values: string[] }))[] = [];

                for (const attribute of attributesWithPassword) {
                    handle_multi_valued_attribute: {
                        if (!attribute.multivalued) {
                            break handle_multi_valued_attribute;
                        }

                        const values = attribute.values ?? [""];

                        apply_validator_min_range: {
                            if (attribute.annotations.inputType === "multiselect") {
                                break apply_validator_min_range;
                            }

                            if (attribute.annotations.inputType === "multiselect-checkboxes") {
                                break apply_validator_min_range;
                            }

                            const validator = attribute.validators.multivalued;

                            if (validator === undefined) {
                                break apply_validator_min_range;
                            }

                            const { min: minStr } = validator;

                            if (minStr === undefined) {
                                break apply_validator_min_range;
                            }

                            const min = parseInt(minStr);

                            for (let index = values.length; index < min; index++) {
                                values.push("");
                            }
                        }

                        initialFormFieldValues.push({
                            attribute,
                            values
                        });

                        continue;
                    }

                    initialFormFieldValues.push({
                        "value": attribute.value ?? "",
                        attribute
                    });
                }

                return initialFormFieldValues;
            })();

            const initialState: internal.State = {
                "formFieldStates": initialFormFieldValues.map(({ attribute, ...valueOrValuesWrap }) => ({
                    attribute,
                    "errors": getErrors({
                        "attributeName": attribute.name,
                        "fieldValues": initialFormFieldValues
                    }),
                    "hasLostFocusAtLeastOnce": "values" in valueOrValuesWrap ? valueOrValuesWrap.values.map(() => false) : false,
                    ...valueOrValuesWrap
                }))
            };

            return initialState;
        }, [])
    );

    const formState: FormState = useMemo(
        () => ({
            "formFieldStates": state.formFieldStates.map(({ errors, hasLostFocusAtLeastOnce, attribute, ...valueOrValuesWrap }) => ({
                "displayableErrors":
                    typeof hasLostFocusAtLeastOnce === "boolean"
                        ? hasLostFocusAtLeastOnce
                            ? errors
                            : []
                        : errors.filter(error => {
                              //TODO

                              // TODO: The errors from server should be always displayed.
                              // even before focus lost.

                              return true;
                          }),
                attribute,
                ...valueOrValuesWrap
            })),
            "isFormSubmittable": state.formFieldStates.every(({ errors }) => errors.length === 0)
        }),
        [state]
    );

    return {
        formState,
        dispatchFormAction
    };
}

function useGetErrors(params: { kcContext: Pick<KcContextLike, "messagesPerField" | "passwordPolicies">; i18n: I18n }) {
    const { kcContext, i18n } = params;

    const { messagesPerField, passwordPolicies } = kcContext;

    const { msg, msgStr, advancedMsg, advancedMsgStr } = i18n;

    const getErrors = useConstCallback(
        (params: {
            attributeName: string;
            fieldValues: ({ attribute: Attribute } & ({ value: string } | { values: string[] }))[];
        }): FormFieldError[] => {
            const { attributeName, fieldValues } = params;

            const fieldValue = fieldValues.find(({ attribute }) => attribute.name === attributeName);

            assert(fieldValue !== undefined);

            const { attribute } = fieldValue;

            assert(attribute !== undefined);

            server_side_error: {
                if (attribute.multivalued) {
                    const defaultValues = attribute.values ?? [""];

                    assert("values" in fieldValue);

                    const { values } = fieldValue;

                    if (JSON.stringify(defaultValues) !== JSON.stringify(values.slice(0, defaultValues.length))) {
                        break server_side_error;
                    }
                } else {
                    const defaultValue = attribute.value ?? "";

                    assert("value" in fieldValue);

                    const { value } = fieldValue;

                    if (defaultValue !== value) {
                        break server_side_error;
                    }
                }

                let doesErrorExist: boolean;

                try {
                    doesErrorExist = messagesPerField.existsError(attributeName);
                } catch {
                    break server_side_error;
                }

                if (!doesErrorExist) {
                    break server_side_error;
                }

                const errorMessageStr = messagesPerField.get(attributeName);

                return [
                    {
                        "validatorName": undefined,
                        errorMessageStr,
                        "errorMessage": <span key={0}>{errorMessageStr}</span>,
                        "fieldIndex": undefined
                    }
                ];
            }

            handle_multi_valued_text_input: {
                if (!attribute.multivalued) {
                    break handle_multi_valued_text_input;
                }

                if (attribute.annotations.inputType === "multiselect") {
                    break handle_multi_valued_text_input;
                }

                if (attribute.annotations.inputType === "multiselect-checkboxes") {
                    break handle_multi_valued_text_input;
                }

                assert("values" in fieldValue);

                const { values } = fieldValue;

                return values
                    .map((value, index) => {
                        const errors = getErrors({
                            attributeName,
                            "fieldValues": fieldValues.map(fieldValue => {
                                if (fieldValue.attribute.name === attributeName) {
                                    return {
                                        "attribute": {
                                            ...attribute,
                                            "annotations": {
                                                ...attribute.annotations,
                                                "inputType": undefined
                                            }
                                        },
                                        value
                                    };
                                }

                                return fieldValue;
                            })
                        });

                        return errors.map((error): FormFieldError => ({ ...error, "fieldIndex": index }));
                    })
                    .reduce((acc, errors) => [...acc, ...errors], []);
            }

            handle_multi_select_or_checkbox: {
                if (!attribute.multivalued) {
                    break handle_multi_select_or_checkbox;
                }

                if (attribute.annotations.inputType !== "multiselect" && attribute.annotations.inputType !== "multiselect-checkboxes") {
                    break handle_multi_select_or_checkbox;
                }

                const validatorName = "multivalued";

                const validator = attribute.validators[validatorName];

                if (validator === undefined) {
                    return [];
                }

                const { min: minStr } = validator;

                const min = minStr === undefined ? 0 : parseInt(minStr);

                assert(!isNaN(min));

                const { max: maxStr } = validator;

                const max = maxStr === undefined ? Infinity : parseInt(maxStr);

                assert(!isNaN(max));

                assert("values" in fieldValue);

                const { values } = fieldValue;

                if (min <= values.length && values.length <= max) {
                    return [];
                }

                const msgArgs = ["error-invalid-multivalued-size", `${min}`, `${max}`] as const;

                return [
                    {
                        "errorMessage": <Fragment key={0}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        validatorName,
                        "fieldIndex": undefined
                    }
                ];
            }

            assert("value" in fieldValue);

            const { value } = fieldValue;

            const errors: FormFieldError[] = [];

            check_password_policies: {
                if (attributeName !== "password") {
                    break check_password_policies;
                }

                if (passwordPolicies === undefined) {
                    break check_password_policies;
                }

                check_password_policy_x: {
                    const policyName = "length";

                    const policy = passwordPolicies[policyName];

                    if (policy === undefined) {
                        break check_password_policy_x;
                    }

                    const minLength = parseInt(policy);

                    assert(!isNaN(minLength));

                    if (value.length >= minLength) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinLengthMessage", `${minLength}`] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });
                }

                check_password_policy_x: {
                    const policyName = "digits";

                    const policy = passwordPolicies[policyName];

                    if (policy === undefined) {
                        break check_password_policy_x;
                    }

                    const minNumberOfDigits = parseInt(policy);

                    assert(!isNaN(minNumberOfDigits));

                    if (value.split("").filter(char => !isNaN(parseInt(char))).length >= minNumberOfDigits) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinDigitsMessage", `${minNumberOfDigits}`] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });
                }

                check_password_policy_x: {
                    const policyName = "lowerCase";

                    const policy = passwordPolicies[policyName];

                    if (policy === undefined) {
                        break check_password_policy_x;
                    }

                    const minNumberOfLowerCaseChar = parseInt(policy);

                    assert(!isNaN(minNumberOfLowerCaseChar));

                    if (
                        value.split("").filter(char => char === char.toLowerCase() && char !== char.toUpperCase()).length >= minNumberOfLowerCaseChar
                    ) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinLowerCaseCharsMessage", `${minNumberOfLowerCaseChar}`] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });
                }

                check_password_policy_x: {
                    const policyName = "upperCase";

                    const policy = passwordPolicies[policyName];

                    if (policy === undefined) {
                        break check_password_policy_x;
                    }

                    const minNumberOfUpperCaseChar = parseInt(policy);

                    assert(!isNaN(minNumberOfUpperCaseChar));

                    if (
                        value.split("").filter(char => char === char.toUpperCase() && char !== char.toLowerCase()).length >= minNumberOfUpperCaseChar
                    ) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinUpperCaseCharsMessage", `${minNumberOfUpperCaseChar}`] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });
                }

                check_password_policy_x: {
                    const policyName = "specialChars";

                    const policy = passwordPolicies[policyName];

                    if (policy === undefined) {
                        break check_password_policy_x;
                    }

                    const minNumberOfSpecialChar = parseInt(policy);

                    assert(!isNaN(minNumberOfSpecialChar));

                    if (value.split("").filter(char => !char.match(/[a-zA-Z0-9]/)).length >= minNumberOfSpecialChar) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinSpecialCharsMessage", `${minNumberOfSpecialChar}`] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });
                }

                check_password_policy_x: {
                    const policyName = "notUsername";

                    const notUsername = passwordPolicies[policyName];

                    if (!notUsername) {
                        break check_password_policy_x;
                    }

                    const usernameFieldValue = fieldValues.find(fieldValue => fieldValue.attribute.name === "username");

                    if (usernameFieldValue === undefined) {
                        break check_password_policy_x;
                    }

                    assert("value" in usernameFieldValue);

                    if (value !== usernameFieldValue.value) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordNotUsernameMessage"] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });
                }

                check_password_policy_x: {
                    const policyName = "notEmail";

                    const notEmail = passwordPolicies[policyName];

                    if (!notEmail) {
                        break check_password_policy_x;
                    }

                    const emailFieldValue = fieldValues.find(fieldValue => fieldValue.attribute.name === "email");

                    if (emailFieldValue === undefined) {
                        break check_password_policy_x;
                    }

                    assert("value" in emailFieldValue);

                    if (value !== emailFieldValue.value) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordNotEmailMessage"] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });
                }
            }

            password_confirm_matches_password: {
                if (attributeName !== "password-confirm") {
                    break password_confirm_matches_password;
                }

                const passwordFieldValue = fieldValues.find(fieldValue => fieldValue.attribute.name === "password");

                assert(passwordFieldValue !== undefined);

                assert("value" in passwordFieldValue);

                if (passwordFieldValue.value === value) {
                    break password_confirm_matches_password;
                }

                const msgArgs = ["invalidPasswordConfirmMessage"] as const;

                errors.push({
                    "validatorName": undefined,
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs),
                    "fieldIndex": undefined
                });
            }

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
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs),
                    "fieldIndex": undefined
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
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        validatorName,
                        "fieldIndex": undefined
                    });
                }

                if (min !== undefined && value.length < parseInt(min)) {
                    const msgArgs = ["error-invalid-length-too-short", min] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        validatorName,
                        "fieldIndex": undefined
                    });
                }
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
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{advancedMsg(...msgArgs)}</Fragment>,
                    "errorMessageStr": advancedMsgStr(...msgArgs),
                    "fieldIndex": undefined
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
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs),
                    "fieldIndex": undefined
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
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });

                    break validator_x;
                }

                if (max !== undefined && intValue > parseInt(max)) {
                    const msgArgs = ["error-number-out-of-range-too-big", max] as const;

                    errors.push({
                        validatorName,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
                    });

                    break validator_x;
                }

                if (min !== undefined && intValue < parseInt(min)) {
                    const msgArgs = ["error-number-out-of-range-too-small", min] as const;

                    errors.push({
                        validatorName,
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined
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
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{advancedMsg(...msgArgs)}</Fragment>,
                    "errorMessageStr": advancedMsgStr(...msgArgs),
                    "fieldIndex": undefined
                });
            }

            //TODO: Implement missing validators.

            return errors;
        }
    );

    return { getErrors };
}
