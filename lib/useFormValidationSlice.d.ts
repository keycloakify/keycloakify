/// <reference types="react" />
import "./tools/Array.prototype.every";
import type { KcContextBase, Validators, Attribute } from "./getKcContext/KcContextBase";
export declare type KcContextLike = {
    messagesPerField: Pick<KcContextBase.Common["messagesPerField"], "existsError" | "get">;
    attributes: {
        name: string;
        value?: string;
        validators: Validators;
    }[];
    passwordRequired: boolean;
    realm: {
        registrationEmailAsUsername: boolean;
    };
};
export declare function useGetErrors(params: {
    kcContext: {
        messagesPerField: Pick<KcContextBase.Common["messagesPerField"], "existsError" | "get">;
        profile: {
            attributes: {
                name: string;
                value?: string;
                validators: Validators;
            }[];
        };
    };
}): {
    getErrors: (params: {
        name: string;
        fieldValueByAttributeName: Record<
            string,
            {
                value: string;
            }
        >;
    }) => {
        errorMessage: JSX.Element;
        errorMessageStr: string;
        validatorName: keyof Validators | undefined;
    }[];
};
export declare function useFormValidationSlice(params: {
    kcContext: {
        messagesPerField: Pick<KcContextBase.Common["messagesPerField"], "existsError" | "get">;
        profile: {
            attributes: Attribute[];
        };
        passwordRequired: boolean;
        realm: {
            registrationEmailAsUsername: boolean;
        };
    };
    /** NOTE: Try to avoid passing a new ref every render for better performances. */
    passwordValidators?: Validators;
}): {
    formValidationState: {
        fieldStateByAttributeName: {
            [k: string]: {
                value: string;
                displayableErrors: {
                    errorMessage: JSX.Element;
                    errorMessageStr: string;
                    validatorName:
                        | "length"
                        | "double"
                        | "pattern"
                        | "email"
                        | "integer"
                        | "up-immutable-attribute"
                        | "up-attribute-required-by-metadata-value"
                        | "up-username-has-value"
                        | "up-duplicate-username"
                        | "up-username-mutation"
                        | "up-email-exists-as-username"
                        | "up-blank-attribute-value"
                        | "up-duplicate-email"
                        | "local-date"
                        | "person-name-prohibited-characters"
                        | "uri"
                        | "username-prohibited-characters"
                        | "_compareToOther"
                        | undefined;
                }[];
            };
        };
        isFormSubmittable: boolean;
    };
    formValidationReducer: import("react").Dispatch<
        | {
              action: "update value";
              name: string;
              newValue: string;
          }
        | {
              action: "focus lost";
              name: string;
          }
    >;
    attributesWithPassword: Attribute[];
};
