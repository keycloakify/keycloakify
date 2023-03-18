import "keycloakify/tools/Array.prototype.every";
import { useMemo, useReducer, Fragment } from "react";
import { id } from "tsafe/id";
import type { MessageKeyBase } from "keycloakify/i18n";
import type { Attribute, Validators } from "keycloakify/kcContext";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import { emailRegexp } from "keycloakify/tools/emailRegExp";
import type { KcContextBase as KcContext } from "../kcContext";
import type { I18nBase as I18n } from "../i18n";

/**
 * NOTE: The attributesWithPassword returned is actually augmented with
 * artificial password related attributes only if kcContext.passwordRequired === true
 */
export function useFormValidation(params: {
    kcContext: {
        messagesPerField: Pick<KcContext.Common.Login["messagesPerField"], "existsError" | "get">;
        profile: {
            attributes: Attribute[];
        };
        passwordRequired?: boolean;
        realm: { registrationEmailAsUsername: boolean };
    };
    /** NOTE: Try to avoid passing a new ref every render for better performances. */
    passwordValidators?: Validators;
    i18n: I18n;
}) {
    const {
        kcContext,
        passwordValidators = {
            "length": {
                "ignore.empty.value": true,
                "min": "4"
            }
        },
        i18n
    } = params;

    const attributesWithPassword = useMemo(
        () =>
            !kcContext.passwordRequired
                ? kcContext.profile.attributes
                : (() => {
                      const name = kcContext.realm.registrationEmailAsUsername ? "email" : "username";

                      return kcContext.profile.attributes.reduce<Attribute[]>(
                          (prev, curr) => [
                              ...prev,
                              ...(curr.name !== name
                                  ? [curr]
                                  : [
                                        curr,
                                        id<Attribute>({
                                            "name": "password",
                                            "displayName": id<`\${${MessageKeyBase}}`>("${password}"),
                                            "required": true,
                                            "readOnly": false,
                                            "validators": passwordValidators,
                                            "annotations": {},
                                            "groupAnnotations": {},
                                            "autocomplete": "new-password"
                                        }),
                                        id<Attribute>({
                                            "name": "password-confirm",
                                            "displayName": id<`\${${MessageKeyBase}}`>("${passwordConfirm}"),
                                            "required": true,
                                            "readOnly": false,
                                            "validators": {
                                                "_compareToOther": {
                                                    "name": "password",
                                                    "ignore.empty.value": true,
                                                    "shouldBe": "equal",
                                                    "error-message": id<`\${${MessageKeyBase}}`>("${invalidPasswordConfirmMessage}")
                                                }
                                            },
                                            "annotations": {},
                                            "groupAnnotations": {},
                                            "autocomplete": "new-password"
                                        })
                                    ])
                          ],
                          []
                      );
                  })(),
        [kcContext, passwordValidators]
    );

    const { getErrors } = useGetErrors({
        "kcContext": {
            "messagesPerField": kcContext.messagesPerField,
            "profile": {
                "attributes": attributesWithPassword
            }
        },
        i18n
    });

    const initialInternalState = useMemo(
        () =>
            Object.fromEntries(
                attributesWithPassword
                    .map(attribute => ({
                        attribute,
                        "errors": getErrors({
                            "name": attribute.name,
                            "fieldValueByAttributeName": Object.fromEntries(
                                attributesWithPassword.map(({ name, value }) => [name, { "value": value ?? "" }])
                            )
                        })
                    }))
                    .map(({ attribute, errors }) => [
                        attribute.name,
                        {
                            "value": attribute.value ?? "",
                            errors,
                            "doDisplayPotentialErrorMessages": errors.length !== 0
                        }
                    ])
            ),
        [attributesWithPassword]
    );

    type InternalState = typeof initialInternalState;

    const [formValidationInternalState, formValidationDispatch] = useReducer(
        (
            state: InternalState,
            params:
                | {
                      action: "update value";
                      name: string;
                      newValue: string;
                  }
                | {
                      action: "focus lost";
                      name: string;
                  }
        ): InternalState => ({
            ...state,
            [params.name]: {
                ...state[params.name],
                ...(() => {
                    switch (params.action) {
                        case "focus lost":
                            return { "doDisplayPotentialErrorMessages": true };
                        case "update value":
                            return {
                                "value": params.newValue,
                                "errors": getErrors({
                                    "name": params.name,
                                    "fieldValueByAttributeName": {
                                        ...state,
                                        [params.name]: { "value": params.newValue }
                                    }
                                })
                            };
                    }
                })()
            }
        }),
        initialInternalState
    );

    const formValidationState = useMemo(
        () => ({
            "fieldStateByAttributeName": Object.fromEntries(
                Object.entries(formValidationInternalState).map(([name, { value, errors, doDisplayPotentialErrorMessages }]) => [
                    name,
                    { value, "displayableErrors": doDisplayPotentialErrorMessages ? errors : [] }
                ])
            ),
            "isFormSubmittable": Object.entries(formValidationInternalState).every(
                ([name, { value, errors }]) =>
                    errors.length === 0 && (value !== "" || !attributesWithPassword.find(attribute => attribute.name === name)!.required)
            )
        }),
        [formValidationInternalState, attributesWithPassword]
    );

    return {
        formValidationState,
        formValidationDispatch,
        attributesWithPassword
    };
}

/** Expect to be used in a component wrapped within a <I18nProvider> */
function useGetErrors(params: {
    kcContext: {
        messagesPerField: Pick<KcContext.Common.Login["messagesPerField"], "existsError" | "get">;
        profile: {
            attributes: { name: string; value?: string; validators: Validators }[];
        };
    };
    i18n: I18n;
}) {
    const { kcContext, i18n } = params;

    const {
        messagesPerField,
        profile: { attributes }
    } = kcContext;

    const { msg, msgStr, advancedMsg, advancedMsgStr } = i18n;

    const getErrors = useConstCallback((params: { name: string; fieldValueByAttributeName: Record<string, { value: string }> }) => {
        const { name, fieldValueByAttributeName } = params;

        const { value } = fieldValueByAttributeName[name];

        const { value: defaultValue, validators } = attributes.find(attribute => attribute.name === name)!;

        block: {
            if (defaultValue !== value) {
                break block;
            }

            let doesErrorExist: boolean;

            try {
                doesErrorExist = messagesPerField.existsError(name);
            } catch {
                break block;
            }

            if (!doesErrorExist) {
                break block;
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

        const errors: {
            errorMessage: JSX.Element;
            errorMessageStr: string;
            validatorName: keyof Validators | undefined;
        }[] = [];

        scope: {
            const validatorName = "length";

            const validator = validators[validatorName];

            if (validator === undefined) {
                break scope;
            }

            const { "ignore.empty.value": ignoreEmptyValue = false, max, min } = validator;

            if (ignoreEmptyValue && value === "") {
                break scope;
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

        scope: {
            const validatorName = "_compareToOther";

            const validator = validators[validatorName];

            if (validator === undefined) {
                break scope;
            }

            const { "ignore.empty.value": ignoreEmptyValue = false, name: otherName, shouldBe, "error-message": errorMessageKey } = validator;

            if (ignoreEmptyValue && value === "") {
                break scope;
            }

            const { value: otherValue } = fieldValueByAttributeName[otherName];

            const isValid = (() => {
                switch (shouldBe) {
                    case "different":
                        return otherValue !== value;
                    case "equal":
                        return otherValue === value;
                }
            })();

            if (isValid) {
                break scope;
            }

            const msgArg = [
                errorMessageKey ??
                    id<MessageKeyBase>(
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

        scope: {
            const validatorName = "pattern";

            const validator = validators[validatorName];

            if (validator === undefined) {
                break scope;
            }

            const { "ignore.empty.value": ignoreEmptyValue = false, pattern, "error-message": errorMessageKey } = validator;

            if (ignoreEmptyValue && value === "") {
                break scope;
            }

            if (new RegExp(pattern).test(value)) {
                break scope;
            }

            const msgArgs = [errorMessageKey ?? id<MessageKeyBase>("shouldMatchPattern"), pattern] as const;

            errors.push({
                validatorName,
                "errorMessage": <Fragment key={errors.length}>{advancedMsg(...msgArgs)}</Fragment>,
                "errorMessageStr": advancedMsgStr(...msgArgs)
            });
        }

        scope: {
            if ([...errors].reverse()[0]?.validatorName === "pattern") {
                break scope;
            }

            const validatorName = "email";

            const validator = validators[validatorName];

            if (validator === undefined) {
                break scope;
            }

            const { "ignore.empty.value": ignoreEmptyValue = false } = validator;

            if (ignoreEmptyValue && value === "") {
                break scope;
            }

            if (emailRegexp.test(value)) {
                break scope;
            }

            const msgArgs = [id<MessageKeyBase>("invalidEmailMessage")] as const;

            errors.push({
                validatorName,
                "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                "errorMessageStr": msgStr(...msgArgs)
            });
        }

        scope: {
            const validatorName = "integer";

            const validator = validators[validatorName];

            if (validator === undefined) {
                break scope;
            }

            const { "ignore.empty.value": ignoreEmptyValue = false, max, min } = validator;

            if (ignoreEmptyValue && value === "") {
                break scope;
            }

            const intValue = parseInt(value);

            if (isNaN(intValue)) {
                const msgArgs = ["mustBeAnInteger"] as const;

                errors.push({
                    validatorName,
                    "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs)
                });

                break scope;
            }

            if (max !== undefined && intValue > parseInt(max)) {
                const msgArgs = ["error-number-out-of-range-too-big", max] as const;

                errors.push({
                    validatorName,
                    "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs)
                });

                break scope;
            }

            if (min !== undefined && intValue < parseInt(min)) {
                const msgArgs = ["error-number-out-of-range-too-small", min] as const;

                errors.push({
                    validatorName,
                    "errorMessage": <Fragment key={errors.length}>{msg(...msgArgs)}</Fragment>,
                    "errorMessageStr": msgStr(...msgArgs)
                });

                break scope;
            }
        }

        scope: {
            const validatorName = "options";

            const validator = validators[validatorName];

            if (validator === undefined) {
                break scope;
            }

            if (value === "") {
                break scope;
            }

            if (validator.options.indexOf(value) >= 0) {
                break scope;
            }

            const msgArgs = [id<MessageKeyBase>("notAValidOption")] as const;

            errors.push({
                validatorName,
                "errorMessage": <Fragment key={errors.length}>{advancedMsg(...msgArgs)}</Fragment>,
                "errorMessageStr": advancedMsgStr(...msgArgs)
            });
        }

        //TODO: Implement missing validators.

        return errors;
    });

    return { getErrors };
}
