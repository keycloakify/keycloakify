import "keycloakify/tools/Array.prototype.every";
import { useMemo, useReducer, Fragment, type Dispatch } from "react";
import { id } from "tsafe/id";
import type { MessageKey } from "keycloakify/login/i18n/i18n";
import type { Attribute, Validators } from "keycloakify/login/kcContext/KcContext";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import { emailRegexp } from "keycloakify/tools/emailRegExp";
import type { KcContext, PasswordPolicies } from "keycloakify/login/kcContext/KcContext";
import type { Param0 } from "tsafe";
import { assert, type Equals } from "tsafe/assert";
import type { I18n } from "../i18n";

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
    passwordConfirmationDisabled?: boolean;
};

export type ReturnTypeOfUseUserProfileForm = {
    formState: FormState;
    dispatchFormAction: Dispatch<FormAction>;
    attributesWithPassword: Attribute[];
};

/**
 * NOTE: The attributesWithPassword returned is actually augmented with
 * artificial password related attributes only if kcContext.passwordRequired === true
 */
export function useUserProfileForm(params: ParamsOfUseUserProfileForm): ReturnTypeOfUseUserProfileForm {
    const { kcContext, i18n, passwordConfirmationDisabled = false } = params;

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
        "attributes": attributesWithPassword,
        i18n
    });

    type FormFieldState_internal = Omit<FormFieldState, "displayableError"> & {
        errors: FormFieldError[];
        hasLostFocusAtLeastOnce: boolean;
    };

    type State = FormFieldState_internal[];

    const [state, dispatchFormAction] = useReducer(
        function reducer(state: State, params: FormAction): State {
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
                    update_password_confirm: {
                        if (params.name !== "password") {
                            break update_password_confirm;
                        }

                        if (!passwordConfirmationDisabled) {
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

                        const values = attribute.values ?? [""];

                        apply_validator_min_range: {
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
    kcContext: Pick<KcContextLike, "messagesPerField" | "passwordPolicies">;
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

    const { messagesPerField, passwordPolicies } = kcContext;

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

            check_password_policies: {
                if (name !== "password") {
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
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
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
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
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
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
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
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
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
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
                    });
                }

                check_password_policy_x: {
                    const policyName = "notUsername";

                    const notUsername = passwordPolicies[policyName];

                    if (!notUsername) {
                        break check_password_policy_x;
                    }

                    const usernameFieldValue = fieldValues.find(fieldValue => fieldValue.name === "username");

                    if (usernameFieldValue === undefined) {
                        break check_password_policy_x;
                    }

                    if (value !== usernameFieldValue.value) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordNotUsernameMessage"] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
                    });
                }

                check_password_policy_x: {
                    const policyName = "notEmail";

                    const notEmail = passwordPolicies[policyName];

                    if (!notEmail) {
                        break check_password_policy_x;
                    }

                    const emailFieldValue = fieldValues.find(fieldValue => fieldValue.name === "email");

                    if (emailFieldValue === undefined) {
                        break check_password_policy_x;
                    }

                    if (value !== emailFieldValue.value) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordNotEmailMessage"] as const;

                    errors.push({
                        "validatorName": undefined,
                        "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs)
                    });
                }
            }

            password_confirm_matches_password: {
                if (name !== "password-confirm") {
                    break password_confirm_matches_password;
                }

                const passwordFieldValue = fieldValues.find(fieldValue => fieldValue.name === "password");

                assert(passwordFieldValue !== undefined);

                if (passwordFieldValue.value === value) {
                    break password_confirm_matches_password;
                }

                const msgArgs = ["invalidPasswordConfirmMessage"] as const;

                errors.push({
                    "validatorName": undefined,
                    "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs)
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
