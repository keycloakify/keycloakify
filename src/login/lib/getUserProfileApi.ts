import "keycloakify/tools/Array.prototype.every";
import { assert } from "tsafe/assert";
import type {
    PasswordPolicies,
    Attribute,
    Validators
} from "keycloakify/login/KcContext";
import type { KcContext } from "../KcContext";
import type { KcContextLike as KcContextLike_i18n } from "keycloakify/login/i18n";

export type FormFieldError = {
    advancedMsgArgs: [string, ...string[]];
    source: FormFieldError.Source;
    fieldIndex: number | undefined;
};

export namespace FormFieldError {
    export type Source =
        | Source.Validator
        | Source.PasswordPolicy
        | Source.Server
        | Source.Other;

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
          /** Default false */
          displayErrorsImmediately?: boolean;
      }
    | {
          action: "focus lost";
          name: string;
          fieldIndex: number | undefined;
      };

export type KcContextLike = KcContextLike_i18n &
    KcContextLike_useGetErrors & {
        profile: {
            attributesByName: Record<string, Attribute>;
            html5DataAnnotations?: Record<string, string>;
        };
        passwordRequired?: boolean;
        realm: { registrationEmailAsUsername: boolean };
        url: {
            resourcesPath: string;
        };
    };

type KcContextLike_useGetErrors = KcContextLike_i18n & {
    messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
    passwordPolicies?: PasswordPolicies;
};

assert<
    Extract<
        Extract<KcContext, { profile: unknown }>,
        { pageId: "register.ftl" }
    > extends KcContextLike
        ? true
        : false
>();

export type UserProfileApi = {
    getFormState: () => FormState;
    subscribeToFormState: (callback: () => void) => { unsubscribe: () => void };
    dispatchFormAction: (action: FormAction) => void;
};

const cachedUserProfileApiByKcContext = new WeakMap<KcContextLike, UserProfileApi>();

export type ParamsOfGetUserProfileApi = {
    kcContext: KcContextLike;
    doMakeUserConfirmPassword: boolean;
};

export function getUserProfileApi(params: ParamsOfGetUserProfileApi): UserProfileApi {
    const { kcContext } = params;

    use_cache: {
        const userProfileApi_cache = cachedUserProfileApiByKcContext.get(kcContext);

        if (userProfileApi_cache === undefined) {
            break use_cache;
        }

        return userProfileApi_cache;
    }

    const userProfileApi = getUserProfileApi_noCache(params);

    cachedUserProfileApiByKcContext.set(kcContext, userProfileApi);

    return userProfileApi;
}

export function getUserProfileApi_noCache(
    params: ParamsOfGetUserProfileApi
): UserProfileApi {
    return null as any;
}
