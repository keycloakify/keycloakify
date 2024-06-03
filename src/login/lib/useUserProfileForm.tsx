import "keycloakify/tools/Array.prototype.every";
import { useMemo, useReducer, useEffect, Fragment, type Dispatch } from "react";
import { id } from "tsafe/id";
import type { MessageKey } from "keycloakify/login/i18n/i18n";
import type { Attribute, Validators } from "keycloakify/login/kcContext/KcContext";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import { emailRegexp } from "keycloakify/tools/emailRegExp";
import type { KcContext, PasswordPolicies } from "keycloakify/login/kcContext/KcContext";
import { assert, type Equals } from "tsafe/assert";
import { formatNumber } from "keycloakify/tools/formatNumber";
import { createUseInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { structuredCloneButFunctions } from "keycloakify/tools/structuredCloneButFunctions";
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
        attributesByName: Record<string, Attribute>;
        html5DataAnnotations?: Record<string, string>;
    };
    passwordRequired?: boolean;
    realm: { registrationEmailAsUsername: boolean };
    passwordPolicies?: PasswordPolicies;
    url: {
        resourcesPath: string;
    };
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

const { useInsertScriptTags } = createUseInsertScriptTags();

export function useUserProfileForm(params: ParamsOfUseUserProfileForm): ReturnTypeOfUseUserProfileForm {
    const { kcContext, i18n, doMakeUserConfirmPassword } = params;

    const { insertScriptTags } = useInsertScriptTags({
        scriptTags: Object.keys(kcContext.profile?.html5DataAnnotations ?? {})
            .filter(key => key !== "kcMultivalued" && key !== "kcNumberFormat") // NOTE: Keycloakify handles it.
            .map(key => ({
                type: "module",
                src: `${kcContext.url.resourcesPath}/js/${key}.js`
            }))
    });

    useEffect(() => {
        insertScriptTags();
    }, []);

    const { getErrors } = useGetErrors({
        kcContext,
        i18n
    });

    const initialState = useMemo((): internal.State => {
        // NOTE: We don't use te kcContext.profile.attributes directly because
        // they don't includes the password and password confirm fields and we want to add them.
        // Also, we want to polyfill the attributes for older Keycloak version before User Profile was introduced.
        // Finally we want to patch the changes made by Keycloak on the attributes format so we have an homogeneous
        // attributes format to work with.
        const syntheticAttributes = (() => {
            const syntheticAttributes: Attribute[] = [];

            const attributes = (() => {
                retrocompat_patch: {
                    if ("profile" in kcContext && "attributes" in kcContext.profile && Object.keys(kcContext.profile.attributesByName).length !== 0) {
                        break retrocompat_patch;
                    }

                    if ("register" in kcContext && kcContext.register instanceof Object && "formData" in kcContext.register) {
                        //NOTE: Handle legacy register.ftl page
                        return (["firstName", "lastName", "email", "username"] as const)
                            .filter(name => (name !== "username" ? true : !kcContext.realm.registrationEmailAsUsername))
                            .map(name =>
                                id<Attribute>({
                                    name: name,
                                    displayName: id<`\${${MessageKey}}`>(`\${${name}}`),
                                    required: true,
                                    value: (kcContext.register as any).formData[name] ?? "",
                                    html5DataAnnotations: {},
                                    readOnly: false,
                                    validators: {},
                                    annotations: {},
                                    autocomplete: (() => {
                                        switch (name) {
                                            case "email":
                                                return "email";
                                            case "username":
                                                return "username";
                                            default:
                                                return undefined;
                                        }
                                    })()
                                })
                            );
                    }

                    if ("user" in kcContext && kcContext.user instanceof Object) {
                        //NOTE: Handle legacy login-update-profile.ftl
                        return (["username", "email", "firstName", "lastName"] as const)
                            .filter(name => (name !== "username" ? true : (kcContext.user as any).editUsernameAllowed))
                            .map(name =>
                                id<Attribute>({
                                    name: name,
                                    displayName: id<`\${${MessageKey}}`>(`\${${name}}`),
                                    required: true,
                                    value: (kcContext as any).user[name] ?? "",
                                    html5DataAnnotations: {},
                                    readOnly: false,
                                    validators: {},
                                    annotations: {},
                                    autocomplete: (() => {
                                        switch (name) {
                                            case "email":
                                                return "email";
                                            case "username":
                                                return "username";
                                            default:
                                                return undefined;
                                        }
                                    })()
                                })
                            );
                    }

                    if ("email" in kcContext && kcContext.email instanceof Object) {
                        //NOTE: Handle legacy update-email.ftl
                        return [
                            id<Attribute>({
                                name: "email",
                                displayName: id<`\${${MessageKey}}`>(`\${email}`),
                                required: true,
                                value: (kcContext.email as any).value ?? "",
                                html5DataAnnotations: {},
                                readOnly: false,
                                validators: {},
                                annotations: {},
                                autocomplete: "email"
                            })
                        ];
                    }

                    assert(false, "Unable to mock user profile from the current kcContext");
                }

                return Object.values(kcContext.profile.attributesByName).map(attribute_pre_group_patch => {
                    if (typeof attribute_pre_group_patch.group === "string" && attribute_pre_group_patch.group !== "") {
                        const { group, groupDisplayHeader, groupDisplayDescription, groupAnnotations, ...rest } =
                            attribute_pre_group_patch as Attribute & {
                                group: string;
                                groupDisplayHeader?: string;
                                groupDisplayDescription?: string;
                                groupAnnotations: Record<string, string>;
                            };

                        return id<Attribute>({
                            ...rest,
                            group: {
                                name: group,
                                displayHeader: groupDisplayHeader,
                                displayDescription: groupDisplayDescription,
                                html5DataAnnotations: {}
                            }
                        });
                    }

                    return attribute_pre_group_patch;
                });
            })();

            for (const attribute of attributes) {
                syntheticAttributes.push(structuredCloneButFunctions(attribute));

                add_password_and_password_confirm: {
                    if (!kcContext.passwordRequired) {
                        break add_password_and_password_confirm;
                    }

                    if (attribute.name !== (kcContext.realm.registrationEmailAsUsername ? "email" : "username")) {
                        // NOTE: We want to add password and password-confirm after the field that identifies the user.
                        // It's either email or username.
                        break add_password_and_password_confirm;
                    }

                    syntheticAttributes.push(
                        {
                            name: "password",
                            displayName: id<`\${${MessageKey}}`>("${password}"),
                            required: true,
                            readOnly: false,
                            validators: {},
                            annotations: {},
                            autocomplete: "new-password",
                            html5DataAnnotations: {},
                            // NOTE: Compat with Keycloak version prior to 24
                            ...({ groupAnnotations: {} } as {})
                        },
                        {
                            name: "password-confirm",
                            displayName: id<`\${${MessageKey}}`>("${passwordConfirm}"),
                            required: true,
                            readOnly: false,
                            validators: {},
                            annotations: {},
                            html5DataAnnotations: {},
                            autocomplete: "new-password",
                            // NOTE: Compat with Keycloak version prior to 24
                            ...({ groupAnnotations: {} } as {})
                        }
                    );
                }
            }

            // NOTE: Consistency patch
            syntheticAttributes.forEach(attribute => {
                if (getIsMultivaluedSingleField({ attribute })) {
                    attribute.multivalued = true;
                }

                if (attribute.multivalued) {
                    attribute.values ??= attribute.value !== undefined ? [attribute.value] : [];
                    delete attribute.value;
                } else {
                    attribute.value ??= attribute.values?.[0];
                    delete attribute.values;
                }
            });

            return syntheticAttributes;
        })();

        const initialFormFieldState = (() => {
            const out: {
                attribute: Attribute;
                valueOrValues: string | string[];
            }[] = [];

            for (const attribute of syntheticAttributes) {
                handle_multi_valued_attribute: {
                    if (!attribute.multivalued) {
                        break handle_multi_valued_attribute;
                    }

                    const values = attribute.values?.length ? attribute.values : [""];

                    apply_validator_min_range: {
                        if (getIsMultivaluedSingleField({ attribute })) {
                            break apply_validator_min_range;
                        }

                        const validator = attribute.validators.multivalued;

                        if (validator === undefined) {
                            break apply_validator_min_range;
                        }

                        const { min: minStr } = validator;

                        if (!minStr) {
                            break apply_validator_min_range;
                        }

                        const min = parseInt(`${minStr}`);

                        for (let index = values.length; index < min; index++) {
                            values.push("");
                        }
                    }

                    out.push({
                        attribute,
                        valueOrValues: values
                    });

                    continue;
                }

                out.push({
                    attribute,
                    valueOrValues: attribute.value ?? ""
                });
            }

            return out;
        })();

        const initialState: internal.State = {
            formFieldStates: initialFormFieldState.map(({ attribute, valueOrValues }) => ({
                attribute,
                errors: getErrors({
                    attributeName: attribute.name,
                    formFieldStates: initialFormFieldState
                }),
                hasLostFocusAtLeastOnce:
                    valueOrValues instanceof Array && !getIsMultivaluedSingleField({ attribute }) ? valueOrValues.map(() => false) : false,
                valueOrValues: valueOrValues
            }))
        };

        return initialState;
    }, []);

    const [state, dispatchFormAction] = useReducer(function reducer(state: internal.State, formAction: FormAction): internal.State {
        const formFieldState = state.formFieldStates.find(({ attribute }) => attribute.name === formAction.name);

        assert(formFieldState !== undefined);

        (() => {
            switch (formAction.action) {
                case "update":
                    formFieldState.valueOrValues = formAction.valueOrValues;

                    apply_formatters: {
                        const { attribute } = formFieldState;

                        const { kcNumberFormat } = attribute.html5DataAnnotations ?? {};

                        if (!kcNumberFormat) {
                            break apply_formatters;
                        }

                        if (formFieldState.valueOrValues instanceof Array) {
                            formFieldState.valueOrValues = formFieldState.valueOrValues.map(value => formatNumber(value, kcNumberFormat));
                        } else {
                            formFieldState.valueOrValues = formatNumber(formFieldState.valueOrValues, kcNumberFormat);
                        }
                    }

                    formFieldState.errors = getErrors({
                        attributeName: formAction.name,
                        formFieldStates: state.formFieldStates
                    });

                    update_password_confirm: {
                        if (doMakeUserConfirmPassword) {
                            break update_password_confirm;
                        }

                        if (formAction.name !== "password") {
                            break update_password_confirm;
                        }

                        state = reducer(state, {
                            action: "update",
                            name: "password-confirm",
                            valueOrValues: formAction.valueOrValues
                        });
                    }

                    return;
                case "focus lost":
                    if (formFieldState.hasLostFocusAtLeastOnce instanceof Array) {
                        const { fieldIndex } = formAction;
                        assert(fieldIndex !== undefined);
                        formFieldState.hasLostFocusAtLeastOnce[fieldIndex] = true;
                        return;
                    }

                    formFieldState.hasLostFocusAtLeastOnce = true;
                    return;
            }
            assert<Equals<typeof formAction, never>>(false);
        })();

        return { ...state };
    }, initialState);

    const formState: FormState = useMemo(
        () => ({
            formFieldStates: state.formFieldStates.map(
                ({ errors, hasLostFocusAtLeastOnce: hasLostFocusAtLeastOnceOrArr, attribute, ...valueOrValuesWrap }) => ({
                    displayableErrors: errors.filter(error => {
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
            isFormSubmittable: state.formFieldStates.every(({ errors }) => errors.length === 0)
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
            formFieldStates: {
                attribute: Attribute;
                valueOrValues: string | string[];
            }[];
        }): FormFieldError[] => {
            const { attributeName, formFieldStates } = params;

            const formFieldState = formFieldStates.find(({ attribute }) => attribute.name === attributeName);

            assert(formFieldState !== undefined);

            const { attribute } = formFieldState;

            const valueOrValues = (() => {
                let { valueOrValues } = formFieldState;

                unFormat_number: {
                    const { kcNumberUnFormat } = attribute.html5DataAnnotations ?? {};

                    if (!kcNumberUnFormat) {
                        break unFormat_number;
                    }

                    if (valueOrValues instanceof Array) {
                        valueOrValues = valueOrValues.map(value => formatNumber(value, kcNumberUnFormat));
                    } else {
                        valueOrValues = formatNumber(valueOrValues, kcNumberUnFormat);
                    }
                }

                return valueOrValues;
            })();

            assert(attribute !== undefined);

            server_side_error: {
                if (attribute.multivalued) {
                    const defaultValues = attribute.values?.length ? attribute.values : [""];

                    assert(valueOrValues instanceof Array);

                    const values = valueOrValues;

                    if (JSON.stringify(defaultValues) !== JSON.stringify(values.slice(0, defaultValues.length))) {
                        break server_side_error;
                    }
                } else {
                    const defaultValue = attribute.value ?? "";

                    assert(typeof valueOrValues === "string");

                    const value = valueOrValues;

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
                        errorMessage: <span key={0}>{errorMessageStr}</span>,
                        fieldIndex: undefined,
                        source: {
                            type: "server"
                        }
                    }
                ];
            }

            handle_multi_valued_multi_fields: {
                if (!attribute.multivalued) {
                    break handle_multi_valued_multi_fields;
                }

                if (getIsMultivaluedSingleField({ attribute })) {
                    break handle_multi_valued_multi_fields;
                }

                assert(valueOrValues instanceof Array);

                const values = valueOrValues;

                const errors = values
                    .map((...[, index]) => {
                        const specificValueErrors = getErrors({
                            attributeName,
                            formFieldStates: formFieldStates.map(formFieldState => {
                                if (formFieldState.attribute.name === attributeName) {
                                    assert(formFieldState.valueOrValues instanceof Array);
                                    return {
                                        attribute: {
                                            ...attribute,
                                            annotations: {
                                                ...attribute.annotations,
                                                inputType: undefined
                                            },
                                            multivalued: false
                                        },
                                        valueOrValues: formFieldState.valueOrValues[index]
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
                            .map(
                                (error): FormFieldError => ({
                                    ...error,
                                    fieldIndex: index
                                })
                            );
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
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "other",
                            rule: "requiredField"
                        }
                    });
                }

                return errors;
            }

            handle_multi_valued_single_field: {
                if (!attribute.multivalued) {
                    break handle_multi_valued_single_field;
                }

                if (!getIsMultivaluedSingleField({ attribute })) {
                    break handle_multi_valued_single_field;
                }

                const validatorName = "multivalued";

                const validator = attribute.validators[validatorName];

                if (validator === undefined) {
                    return [];
                }

                const { min: minStr } = validator;

                const min = minStr ? parseInt(`${minStr}`) : attribute.required ? 1 : 0;

                assert(!isNaN(min));

                const { max: maxStr } = validator;

                const max = !maxStr ? Infinity : parseInt(`${maxStr}`);

                assert(!isNaN(max));

                assert(valueOrValues instanceof Array);

                const values = valueOrValues;

                if (min <= values.length && values.length <= max) {
                    return [];
                }

                const msgArgs = ["error-invalid-multivalued-size", `${min}`, `${max}`] as const;

                return [
                    {
                        errorMessage: <Fragment key={0}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "validator",
                            name: validatorName
                        }
                    }
                ];
            }

            assert(typeof valueOrValues === "string");

            const value = valueOrValues;

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

                    if (!policy) {
                        break check_password_policy_x;
                    }

                    const minLength = policy;

                    if (value.length >= minLength) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinLengthMessage", `${minLength}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "passwordPolicy",
                            name: policyName
                        }
                    });
                }

                check_password_policy_x: {
                    const policyName = "digits";

                    const policy = passwordPolicies[policyName];

                    if (!policy) {
                        break check_password_policy_x;
                    }

                    const minNumberOfDigits = policy;

                    if (value.split("").filter(char => !isNaN(parseInt(char))).length >= minNumberOfDigits) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinDigitsMessage", `${minNumberOfDigits}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "passwordPolicy",
                            name: policyName
                        }
                    });
                }

                check_password_policy_x: {
                    const policyName = "lowerCase";

                    const policy = passwordPolicies[policyName];

                    if (!policy) {
                        break check_password_policy_x;
                    }

                    const minNumberOfLowerCaseChar = policy;

                    if (
                        value.split("").filter(char => char === char.toLowerCase() && char !== char.toUpperCase()).length >= minNumberOfLowerCaseChar
                    ) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinLowerCaseCharsMessage", `${minNumberOfLowerCaseChar}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "passwordPolicy",
                            name: policyName
                        }
                    });
                }

                check_password_policy_x: {
                    const policyName = "upperCase";

                    const policy = passwordPolicies[policyName];

                    if (!policy) {
                        break check_password_policy_x;
                    }

                    const minNumberOfUpperCaseChar = policy;

                    if (
                        value.split("").filter(char => char === char.toUpperCase() && char !== char.toLowerCase()).length >= minNumberOfUpperCaseChar
                    ) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinUpperCaseCharsMessage", `${minNumberOfUpperCaseChar}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "passwordPolicy",
                            name: policyName
                        }
                    });
                }

                check_password_policy_x: {
                    const policyName = "specialChars";

                    const policy = passwordPolicies[policyName];

                    if (!policy) {
                        break check_password_policy_x;
                    }

                    const minNumberOfSpecialChar = policy;

                    if (value.split("").filter(char => !char.match(/[a-zA-Z0-9]/)).length >= minNumberOfSpecialChar) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordMinSpecialCharsMessage", `${minNumberOfSpecialChar}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "passwordPolicy",
                            name: policyName
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

                    if (!usernameFormFieldState) {
                        break check_password_policy_x;
                    }

                    const usernameValue = (() => {
                        let { valueOrValues } = usernameFormFieldState;

                        assert(typeof valueOrValues === "string");

                        unFormat_number: {
                            const { kcNumberUnFormat } = attribute.html5DataAnnotations ?? {};

                            if (!kcNumberUnFormat) {
                                break unFormat_number;
                            }

                            valueOrValues = formatNumber(valueOrValues, kcNumberUnFormat);
                        }

                        return valueOrValues;
                    })();

                    if (usernameValue === "") {
                        break check_password_policy_x;
                    }

                    if (value !== usernameValue) {
                        break check_password_policy_x;
                    }

                    const msgArgs = ["invalidPasswordNotUsernameMessage"] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "passwordPolicy",
                            name: policyName
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

                    if (!emailFormFieldState) {
                        break check_password_policy_x;
                    }

                    assert(typeof emailFormFieldState.valueOrValues === "string");

                    {
                        const emailValue = emailFormFieldState.valueOrValues;

                        if (emailValue === "") {
                            break check_password_policy_x;
                        }

                        if (value !== emailValue) {
                            break check_password_policy_x;
                        }
                    }

                    const msgArgs = ["invalidPasswordNotEmailMessage"] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source: {
                            type: "passwordPolicy",
                            name: policyName
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
                    errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    errorMessageStr: msgStr(...msgArgs),
                    fieldIndex: undefined,
                    source: {
                        type: "other",
                        rule: "passwordConfirmMatchesPassword"
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
                    errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    errorMessageStr: msgStr(...msgArgs),
                    fieldIndex: undefined,
                    source: {
                        type: "other",
                        rule: "requiredField"
                    }
                });
            }

            validator_x: {
                const validatorName = "length";

                const validator = validators[validatorName];

                if (!validator) {
                    break validator_x;
                }

                const { "ignore.empty.value": ignoreEmptyValue = false, max, min } = validator;

                if (ignoreEmptyValue && value === "") {
                    break validator_x;
                }

                const source: FormFieldError.Source = {
                    type: "validator",
                    name: validatorName
                };

                if (max && value.length > parseInt(`${max}`)) {
                    const msgArgs = ["error-invalid-length-too-long", `${max}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source
                    });
                }

                if (min && value.length < parseInt(`${min}`)) {
                    const msgArgs = ["error-invalid-length-too-short", `${min}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
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
                    errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{advancedMsg(...msgArgs)}</Fragment>,
                    errorMessageStr: advancedMsgStr(...msgArgs),
                    fieldIndex: undefined,
                    source: {
                        type: "validator",
                        name: validatorName
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
                    errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                    errorMessageStr: msgStr(...msgArgs),
                    fieldIndex: undefined,
                    source: {
                        type: "validator",
                        name: validatorName
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
                    type: "validator",
                    name: validatorName
                };

                if (isNaN(intValue)) {
                    const msgArgs = ["mustBeAnInteger"] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source
                    });

                    break validator_x;
                }

                if (max && intValue > parseInt(`${max}`)) {
                    const msgArgs = ["error-number-out-of-range-too-big", `${max}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
                        source
                    });

                    break validator_x;
                }

                if (min && intValue < parseInt(`${min}`)) {
                    const msgArgs = ["error-number-out-of-range-too-small", `${min}`] as const;

                    errors.push({
                        errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{msg(...msgArgs)}</Fragment>,
                        errorMessageStr: msgStr(...msgArgs),
                        fieldIndex: undefined,
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
                    errorMessage: <Fragment key={`${attributeName}-${errors.length}`}>{advancedMsg(...msgArgs)}</Fragment>,
                    errorMessageStr: advancedMsgStr(...msgArgs),
                    fieldIndex: undefined,
                    source: {
                        type: "validator",
                        name: validatorName
                    }
                });
            }

            //TODO: Implement missing validators. See Validators type definition.

            return errors;
        }
    );

    return { getErrors };
}

function getIsMultivaluedSingleField(params: { attribute: Attribute }) {
    const { attribute } = params;

    return attribute.annotations.inputType?.startsWith("multiselect") ?? false;
}

export function getButtonToDisplayForMultivaluedAttributeField(params: { attribute: Attribute; values: string[]; fieldIndex: number }) {
    const { attribute, values, fieldIndex } = params;

    const hasRemove = (() => {
        if (values.length === 1) {
            return false;
        }

        const minCount = (() => {
            const { multivalued } = attribute.validators;

            if (multivalued === undefined) {
                return undefined;
            }

            const minStr = multivalued.min;

            if (minStr === undefined) {
                return undefined;
            }

            return parseInt(`${minStr}`);
        })();

        if (minCount === undefined) {
            return true;
        }

        if (values.length === minCount) {
            return false;
        }

        return true;
    })();

    const hasAdd = (() => {
        if (fieldIndex + 1 !== values.length) {
            return false;
        }

        const maxCount = (() => {
            const { multivalued } = attribute.validators;

            if (multivalued === undefined) {
                return undefined;
            }

            const maxStr = multivalued.max;

            if (maxStr === undefined) {
                return undefined;
            }

            return parseInt(`${maxStr}`);
        })();

        if (maxCount === undefined) {
            return false;
        }

        if (values.length === maxCount) {
            return false;
        }

        return true;
    })();

    return { hasRemove, hasAdd };
}
