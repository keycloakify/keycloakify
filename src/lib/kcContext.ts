
import { ftlValuesGlobalName } from "../bin/build-keycloak-theme/ftlValuesGlobalName";
import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
import { id } from "evt/tools/typeSafety/id";
import type { KcLanguageTag } from "./i18n/KcLanguageTag";
import { doExtends } from "evt/tools/typeSafety/doExtends";
import type { MessageKey } from "./i18n/useKcTranslation";
import type { LanguageLabel } from "./i18n/KcLanguageTag";

type ExtractAfterStartingWith<Prefix extends string, StrEnum> = 
    StrEnum extends `${Prefix}${infer U}` ? U : never;

export type KcContext = KcContext.Login | KcContext.Register | KcContext.Info;
export declare namespace KcContext {

    export type Template = {
        url: {
            loginAction: string;
            resourcesPath: string;
            resourcesCommonPath: string;
            loginRestartFlowUrl: string;
            loginUrl: string;
        };
        realm: {
            displayName?: string;
            displayNameHtml?: string;
            internationalizationEnabled: boolean;
            password: boolean;
            registrationEmailAsUsername: boolean;
        };
        /** Undefined if !realm.internationalizationEnabled */
        locale?: {
            supported: {
                url: string;
                languageTag: KcLanguageTag;
                /** Is determined by languageTag. Ex: languageTag === "en" => label === "English"
                 * or getLanguageLabel(languageTag) === label
                 */
                //label: LanguageLabel;
            }[];
            current: LanguageLabel;
        },
        auth?: {
            showUsername: boolean;
            showResetCredentials: boolean;
            showTryAnotherWayLink: boolean;
            attemptedUsername?: boolean;
        };
        scripts: string[];
        message?: {
            type: "success" | "warning" | "error" | "info";
            summary: string;
        };
        isAppInitiatedAction: boolean;
    };

    export type Login = Template & {
        pageBasename: "login.ftl";
        url: {
            loginResetCredentialsUrl: string;
            registrationUrl: string;
        };
        realm: {
            loginWithEmailAllowed: boolean;
            rememberMe: boolean;
            resetPasswordAllowed: boolean;
            registrationAllowed: boolean;
        };
        auth: {
            selectedCredential?: string;
        };
        registrationDisabled: boolean;
        login: {
            username?: string;
            rememberMe: boolean;
        };
        usernameEditDisabled: boolean;
        social: {
            displayInfo: boolean;
            providers?: {
                loginUrl: string;
                alias: string;
                providerId: string;
                displayName: string;
            }[]
        };
    };

    export type Register = Template & {
        pageBasename: "register.ftl";
        url: {
            registrationAction: string;
        };
        messagesPerField: {
            printIfExists<T>(
                key:
                    "userLabel" |
                    "username" |
                    "email" |
                    "firstName" |
                    "lastName" |
                    "password" |
                    "password-confirm",
                x: T
            ): T | undefined;
        };
        register: {
            formData: {
                firstName?: string;
                displayName?: string;
                lastName?: string;
                email?: string;
                username?: string;
            }
        };
        passwordRequired: boolean;
        recaptchaRequired: boolean;
        /** undefined if !recaptchaRequired */
        recaptchaSiteKey?: string;
    };

    export type Info = Template & {
        pageBasename: "info.ftl";
        messageHeader?: string;
        requiredActions?: ExtractAfterStartingWith<"requiredAction.",MessageKey>[];
        skipLink: boolean;
        pageRedirectUri?: string;
        actionUri?: string;
        client: {
            baseUrl?: string;
        }
    };

}

{
    type T = KcContext["pageBasename"];
    type U = Parameters<ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"]>[0]["pageBasename"];

    doExtends<T, U>();
    doExtends<U, T>();
}

export const kcContext = id<KcContext | undefined>((window as any)[ftlValuesGlobalName]);
