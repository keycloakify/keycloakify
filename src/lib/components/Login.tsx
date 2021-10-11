import { useState, memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useKcMessage } from "../i18n/useKcMessage";
import { useCssAndCx } from "tss-react";
import { useConstCallback } from "powerhooks/useConstCallback";

export const Login = memo(
    ({ kcContext, ...props }: { kcContext: KcContextBase.Login } & KcProps) => {
        const {
            social,
            realm,
            url,
            usernameEditDisabled,
            login,
            auth,
            registrationDisabled,
        } = kcContext;

        const { msg, msgStr } = useKcMessage();

        const { cx } = useCssAndCx();

        const [isLoginButtonDisabled, setIsLoginButtonDisabled] =
            useState(false);

        const onSubmit = useConstCallback(
            () => (setIsLoginButtonDisabled(true), true),
        );

        return (
            <Template
                {...{ kcContext, ...props }}
                doFetchDefaultThemeResources={true}
                displayInfo={social.displayInfo}
                displayWide={realm.password && social.providers !== undefined}
                headerNode={msg("doLogIn")}
                formNode={
                    <div
                        id="kc-form"
                        className={cx(
                            realm.password &&
                                social.providers !== undefined &&
                                props.kcContentWrapperClass,
                        )}
                    >
                        <div
                            id="kc-form-wrapper"
                            className={cx(
                                realm.password &&
                                    social.providers && [
                                        props.kcFormSocialAccountContentClass,
                                        props.kcFormSocialAccountClass,
                                    ],
                            )}
                        >
                            {realm.password && (
                                <form
                                    id="kc-form-login"
                                    onSubmit={onSubmit}
                                    action={url.loginAction}
                                    method="post"
                                >
                                    <div className={cx(props.kcFormGroupClass)}>
                                        <label
                                            htmlFor="username"
                                            className={cx(props.kcLabelClass)}
                                        >
                                            {!realm.loginWithEmailAllowed
                                                ? msg("username")
                                                : !realm.registrationEmailAsUsername
                                                ? msg("usernameOrEmail")
                                                : msg("email")}
                                        </label>
                                        <input
                                            tabIndex={1}
                                            id="username"
                                            className={cx(props.kcInputClass)}
                                            name="username"
                                            defaultValue={login.username ?? ""}
                                            type="text"
                                            {...(usernameEditDisabled
                                                ? { "disabled": true }
                                                : {
                                                      "autoFocus": true,
                                                      "autoComplete": "off",
                                                  })}
                                        />
                                    </div>
                                    <div className={cx(props.kcFormGroupClass)}>
                                        <label
                                            htmlFor="password"
                                            className={cx(props.kcLabelClass)}
                                        >
                                            {msg("password")}
                                        </label>
                                        <input
                                            tabIndex={2}
                                            id="password"
                                            className={cx(props.kcInputClass)}
                                            name="password"
                                            type="password"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div
                                        className={cx(
                                            props.kcFormGroupClass,
                                            props.kcFormSettingClass,
                                        )}
                                    >
                                        <div id="kc-form-options">
                                            {realm.rememberMe &&
                                                !usernameEditDisabled && (
                                                    <div className="checkbox">
                                                        <label>
                                                            <input
                                                                tabIndex={3}
                                                                id="rememberMe"
                                                                name="rememberMe"
                                                                type="checkbox"
                                                                {...(login.rememberMe
                                                                    ? {
                                                                          "checked":
                                                                              true,
                                                                      }
                                                                    : {})}
                                                            />
                                                            {msg("rememberMe")}
                                                        </label>
                                                    </div>
                                                )}
                                        </div>
                                        <div
                                            className={cx(
                                                props.kcFormOptionsWrapperClass,
                                            )}
                                        >
                                            {realm.resetPasswordAllowed && (
                                                <span>
                                                    <a
                                                        tabIndex={5}
                                                        href={
                                                            url.loginResetCredentialsUrl
                                                        }
                                                    >
                                                        {msg(
                                                            "doForgotPassword",
                                                        )}
                                                    </a>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        id="kc-form-buttons"
                                        className={cx(props.kcFormGroupClass)}
                                    >
                                        <input
                                            type="hidden"
                                            id="id-hidden-input"
                                            name="credentialId"
                                            {...(auth?.selectedCredential !==
                                            undefined
                                                ? {
                                                      "value":
                                                          auth.selectedCredential,
                                                  }
                                                : {})}
                                        />
                                        <input
                                            tabIndex={4}
                                            className={cx(
                                                props.kcButtonClass,
                                                props.kcButtonPrimaryClass,
                                                props.kcButtonBlockClass,
                                                props.kcButtonLargeClass,
                                            )}
                                            name="login"
                                            id="kc-login"
                                            type="submit"
                                            value={msgStr("doLogIn")}
                                            disabled={isLoginButtonDisabled}
                                        />
                                    </div>
                                </form>
                            )}
                        </div>
                        {realm.password && social.providers !== undefined && (
                            <div
                                id="kc-social-providers"
                                className={cx(
                                    props.kcFormSocialAccountContentClass,
                                    props.kcFormSocialAccountClass,
                                )}
                            >
                                <ul
                                    className={cx(
                                        props.kcFormSocialAccountListClass,
                                        social.providers.length > 4 &&
                                            props.kcFormSocialAccountDoubleListClass,
                                    )}
                                >
                                    {social.providers.map(p => (
                                        <li
                                            key={p.providerId}
                                            className={cx(
                                                props.kcFormSocialAccountListLinkClass,
                                            )}
                                        >
                                            <a
                                                href={p.loginUrl}
                                                id={`zocial-${p.alias}`}
                                                className={cx(
                                                    "zocial",
                                                    p.providerId,
                                                )}
                                            >
                                                <span>{p.displayName}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                }
                infoNode={
                    realm.password &&
                    realm.registrationAllowed &&
                    !registrationDisabled && (
                        <div id="kc-registration">
                            <span>
                                {msg("noAccount")}
                                <a tabIndex={6} href={url.registrationUrl}>
                                    {msg("doRegister")}
                                </a>
                            </span>
                        </div>
                    )
                }
            />
        );
    },
);
