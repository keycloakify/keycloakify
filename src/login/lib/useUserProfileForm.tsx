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
    source: FormFieldError.Source;
    fieldIndex: number | undefined;
};

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

export type FormFieldState = {
    attribute: Attribute;
    displayableErrors: FormFieldError[];
    valueOrValues: string | string[];
};

export type FormState = {
    isFormSubmittable: boolean;
    formFieldStates: FormFieldState[];
};

export type FormAction =
    | {
          action: "update";
          name: string;
          valueOrValues: string | string[];
      }
    | {
          action: "focus lost";
          name: string;
          fieldIndex: number | undefined;
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
    export type FormFieldState = {
        attribute: Attribute;
        errors: FormFieldError[];
        hasLostFocusAtLeastOnce: boolean | boolean[];
        valueOrValues: string | string[];
    };

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
            const formFieldState = state.formFieldStates.find(({ attribute }) => attribute.name === params.name);

            assert(formFieldState !== undefined);

            (() => {
                switch (params.action) {
                    case "update":
                        formFieldState.valueOrValues = params.valueOrValues;

                        formFieldState.errors = getErrors({
                            "attributeName": params.name,
                            "formFieldStates": state.formFieldStates
                        });

                        update_password_confirm: {
                            if (doMakeUserConfirmPassword) {
                                break update_password_confirm;
                            }

                            if (params.name !== "password") {
                                break update_password_confirm;
                            }

                            state = reducer(state, {
                                "action": "update",
                                "name": "password-confirm",
                                "valueOrValues": params.valueOrValues
                            });
                        }

                        return;
                    case "focus lost":
                        if (formFieldState.hasLostFocusAtLeastOnce instanceof Array) {
                            const { fieldIndex } = params;
                            assert(fieldIndex !== undefined);
                            formFieldState.hasLostFocusAtLeastOnce[fieldIndex] = true;
                            return;
                        }

                        formFieldState.hasLostFocusAtLeastOnce = true;
                        return;
                }
                assert<Equals<typeof params, never>>(false);
            })();

            return state;
        },
        useMemo(function getInitialState(): internal.State {
            const initialFormFieldState = (() => {
                const out: { attribute: Attribute; valueOrValues: string | string[] }[] = [];

                for (const attribute of attributesWithPassword) {
                    handle_multi_valued_attribute: {
                        if (!attribute.multivalued) {
                            break handle_multi_valued_attribute;
                        }

                        const values = attribute.values ?? [""];

                        apply_validator_min_range: {
                            if (attribute.annotations.inputType?.startsWith("multiselect")) {
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

                        out.push({
                            attribute,
                            "valueOrValues": values
                        });

                        continue;
                    }

                    out.push({
                        attribute,
                        "valueOrValues": attribute.value ?? ""
                    });
                }

                return out;
            })();

            const initialState: internal.State = {
                "formFieldStates": initialFormFieldState.map(({ attribute, valueOrValues }) => ({
                    attribute,
                    "errors": getErrors({
                        "attributeName": attribute.name,
                        "formFieldStates": initialFormFieldState
                    }),
                    "hasLostFocusAtLeastOnce": valueOrValues instanceof Array ? valueOrValues.map(() => false) : false,
                    "valueOrValues": valueOrValues
                }))
            };

            return initialState;
        }, [])
    );

    const formState: FormState = useMemo(
        () => ({
            "formFieldStates": state.formFieldStates.map(
                ({ errors, hasLostFocusAtLeastOnce: hasLostFocusAtLeastOnceOrArr, attribute, ...valueOrValuesWrap }) => ({
                    "displayableErrors": errors.filter(error => {
                        const hasLostFocusAtLeastOnce =
                            typeof hasLostFocusAtLeastOnceOrArr === "boolean"
                                ? hasLostFocusAtLeastOnceOrArr
                                : error.fieldIndex !== undefined
                                ? hasLostFocusAtLeastOnceOrArr[error.fieldIndex]
                                : hasLostFocusAtLeastOnceOrArr[hasLostFocusAtLeastOnceOrArr.length - 1];

                        switch (error.source.type) {
                            case "server":
                                return true;
                            case "other":
                                switch (error.source.rule) {
                                    case "requiredField":
                                        return hasLostFocusAtLeastOnce;
                                    case "passwordConfirmMatchesPassword":
                                        return hasLostFocusAtLeastOnce;
                                }
                                assert<Equals<typeof error.source.rule, never>>(false);
                            case "passwordPolicy":
                                switch (error.source.name) {
                                    case "length":
                                        return hasLostFocusAtLeastOnce;
                                    case "digits":
                                        return hasLostFocusAtLeastOnce;
                                    case "lowerCase":
                                        return hasLostFocusAtLeastOnce;
                                    case "upperCase":
                                        return hasLostFocusAtLeastOnce;
                                    case "specialChars":
                                        return hasLostFocusAtLeastOnce;
                                    case "notUsername":
                                        return true;
                                    case "notEmail":
                                        return true;
                                }
                                assert<Equals<typeof error.source, never>>(false);
                            case "validator":
                                switch (error.source.name) {
                                    case "length":
                                        return hasLostFocusAtLeastOnce;
                                    case "pattern":
                                        return hasLostFocusAtLeastOnce;
                                    case "email":
                                        return hasLostFocusAtLeastOnce;
                                    case "integer":
                                        return hasLostFocusAtLeastOnce;
                                    case "multivalued":
                                        return hasLostFocusAtLeastOnce;
                                    case "options":
                                        return hasLostFocusAtLeastOnce;
                                }
                                assert<Equals<typeof error.source, never>>(false);
                        }
                    }),
                    attribute,
                    ...valueOrValuesWrap
                })
            ),
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
        (params: { attributeName: string; formFieldStates: { attribute: Attribute; valueOrValues: string | string[] }[] }): FormFieldError[] => {
            const { attributeName, formFieldStates } = params;

            const formFieldState = formFieldStates.find(({ attribute }) => attribute.name === attributeName);

            assert(formFieldState !== undefined);

            const { attribute } = formFieldState;

            assert(attribute !== undefined);

            server_side_error: {
                if (attribute.multivalued) {
                    const defaultValues = attribute.values ?? [""];

                    assert(formFieldState.valueOrValues instanceof Array);

                    const values = formFieldState.valueOrValues;

                    if (JSON.stringify(defaultValues) !== JSON.stringify(values.slice(0, defaultValues.length))) {
                        break server_side_error;
                    }
                } else {
                    const defaultValue = attribute.value ?? "";

                    assert(typeof formFieldState.valueOrValues === "string");

                    const value = formFieldState.valueOrValues;

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
                        errorMessageStr,
                        "errorMessage": <span key={0}>{errorMessageStr}</span>,
                        "fieldIndex": undefined,
                        "source": {
                            "type": "server"
                        }
                    }
                ];
            }

            handle_multi_valued_multi_fields: {
                if (!attribute.multivalued) {
                    break handle_multi_valued_multi_fields;
                }

                if (attribute.annotations.inputType?.startsWith("multiselect")) {
                    break handle_multi_valued_multi_fields;
                }

                assert(formFieldState.valueOrValues instanceof Array);

                const values = formFieldState.valueOrValues;

                const errors = values
                    .map((value, index) => {
                        const specificValueErrors = getErrors({
                            attributeName,
                            "formFieldStates": formFieldStates.map(formFieldState => {
                                if (formFieldState.attribute.name === attributeName) {
                                    return {
                                        "attribute": {
                                            ...attribute,
                                            "annotations": {
                                                ...attribute.annotations,
                                                "inputType": undefined
                                            }
                                        },
                                        "valueOrValues": value
                                    };
                                }

                                return formFieldState;
                            })
                        });

                        return specificValueErrors
                            .filter(error => {
                                if (error.source.type === "other" && error.source.rule === "requiredField") {
                                    return false;
                                }

                                return true;
                            })
                            .map((error): FormFieldError => ({ ...error, "fieldIndex": index }));
                    })
                    .reduce((acc, errors) => [...acc, ...errors], []);

                required_field: {
                    if (!attribute.required) {
                        break required_field;
                    }

                    if (values.every(value => value !== "")) {
                        break required_field;
                    }

                    const msgArgs = ["error-user-attribute-required"] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "other",
                            "rule": "requiredField"
                        }
                    });
                }

                return errors;
            }

            handle_multi_valued_single_field: {
                if (!attribute.multivalued) {
                    break handle_multi_valued_single_field;
                }

                if (!attribute.annotations.inputType?.startsWith("multiselect")) {
                    break handle_multi_valued_single_field;
                }

                const validatorName = "multivalued";

                const validator = attribute.validators[validatorName];

                if (validator === undefined) {
                    return [];
                }

                const { min: minStr } = validator;

                const min = minStr !== undefined ? parseInt(minStr) : attribute.required ? 1 : 0;

                assert(!isNaN(min));

                const { max: maxStr } = validator;

                const max = maxStr === undefined ? Infinity : parseInt(maxStr);

                assert(!isNaN(max));

                assert(formFieldState.valueOrValues instanceof Array);

                const values = formFieldState.valueOrValues;

                if (min <= values.length && values.length <= max) {
                    return [];
                }

                const msgArgs = ["error-invalid-multivalued-size", `${min}`, `${max}`] as const;

                return [
                    {
                        "errorMessage": <Fragment key={0}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "validator",
                            "name": validatorName
                        }
                    }
                ];
            }

            assert(typeof formFieldState.valueOrValues === "string");

            const value = formFieldState.valueOrValues;

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
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "passwordPolicy",
                            "name": policyName
                        }
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
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "passwordPolicy",
                            "name": policyName
                        }
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
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "passwordPolicy",
                            "name": policyName
                        }
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
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "passwordPolicy",
                            "name": policyName
                        }
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
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "passwordPolicy",
                            "name": policyName
                        }
                    });
                }

                check_password_policy_x: {
                    const policyName = "notUsername";

                    const notUsername = passwordPolicies[policyName];

                    if (!notUsername) {
                        break check_password_policy_x;
                    }

                    const usernameFormFieldState = formFieldStates.find(formFieldState => formFieldState.attribute.name === "username");

                    if (usernameFormFieldState === undefined) {
                        break check_password_policy_x;
                    }

                    assert(typeof usernameFormFieldState.valueOrValues === "string");

                    {
                        const usernameValue = usernameFormFieldState.valueOrValues;

                        if (value !== usernameValue) {
                            break check_password_policy_x;
                        }
                    }

                    const msgArgs = ["invalidPasswordNotUsernameMessage"] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "passwordPolicy",
                            "name": policyName
                        }
                    });
                }

                check_password_policy_x: {
                    const policyName = "notEmail";

                    const notEmail = passwordPolicies[policyName];

                    if (!notEmail) {
                        break check_password_policy_x;
                    }

                    const emailFormFieldState = formFieldStates.find(formFieldState => formFieldState.attribute.name === "email");

                    if (emailFormFieldState === undefined) {
                        break check_password_policy_x;
                    }

                    assert(typeof emailFormFieldState.valueOrValues === "string");

                    {
                        const emailValue = emailFormFieldState.valueOrValues;

                        if (value !== emailValue) {
                            break check_password_policy_x;
                        }
                    }

                    const msgArgs = ["invalidPasswordNotEmailMessage"] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        "source": {
                            "type": "passwordPolicy",
                            "name": policyName
                        }
                    });
                }
            }

            password_confirm_matches_password: {
                if (attributeName !== "password-confirm") {
                    break password_confirm_matches_password;
                }

                const passwordFormFieldState = formFieldStates.find(formFieldState => formFieldState.attribute.name === "password");

                assert(passwordFormFieldState !== undefined);

                assert(typeof passwordFormFieldState.valueOrValues === "string");

                {
                    const passwordValue = passwordFormFieldState.valueOrValues;

                    if (value === passwordValue) {
                        break password_confirm_matches_password;
                    }
                }

                const msgArgs = ["invalidPasswordConfirmMessage"] as const;

                errors.push({
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs),
                    "fieldIndex": undefined,
                    "source": {
                        "type": "other",
                        "rule": "passwordConfirmMatchesPassword"
                    }
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
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs),
                    "fieldIndex": undefined,
                    "source": {
                        "type": "other",
                        "rule": "requiredField"
                    }
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

                const source: FormFieldError.Source = {
                    "type": "validator",
                    "name": validatorName
                };

                if (max !== undefined && value.length > parseInt(max)) {
                    const msgArgs = ["error-invalid-length-too-long", max] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        source
                    });
                }

                if (min !== undefined && value.length < parseInt(min)) {
                    const msgArgs = ["error-invalid-length-too-short", min] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        source
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
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{advancedMsg(...msgArgs)}</Fragment>,
                    "errorMessageStr": advancedMsgStr(...msgArgs),
                    "fieldIndex": undefined,
                    "source": {
                        "type": "validator",
                        "name": validatorName
                    }
                });
            }

            validator_x: {
                {
                    const lastError = errors[errors.length - 1];
                    if (lastError !== undefined && lastError.source.type === "validator" && lastError.source.name === "pattern") {
                        break validator_x;
                    }
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
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs),
                    "fieldIndex": undefined,
                    "source": {
                        "type": "validator",
                        "name": validatorName
                    }
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

                const source: FormFieldError.Source = {
                    "type": "validator",
                    "name": validatorName
                };

                if (isNaN(intValue)) {
                    const msgArgs = ["mustBeAnInteger"] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        source
                    });

                    break validator_x;
                }

                if (max !== undefined && intValue > parseInt(max)) {
                    const msgArgs = ["error-number-out-of-range-too-big", max] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        source
                    });

                    break validator_x;
                }

                if (min !== undefined && intValue < parseInt(min)) {
                    const msgArgs = ["error-number-out-of-range-too-small", min] as const;

                    errors.push({
                        "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        "errorMessageStr": msgStr(...msgArgs),
                        "fieldIndex": undefined,
                        source
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
                    "errorMessage": <Fragment key={`${attributeName}-${errors.length}`}>{advancedMsg(...msgArgs)}</Fragment>,
                    "errorMessageStr": advancedMsgStr(...msgArgs),
                    "fieldIndex": undefined,
                    "source": {
                        "type": "validator",
                        "name": validatorName
                    }
                });
            }

            //TODO: Implement missing validators. See Validators type definition.

            return errors;
        }
    );

    return { getErrors };
}
