import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useKcMessage } from "../i18n/useKcMessage";
import { useCssAndCx } from "tss-react";

export const LoginUpdatePassword = memo(({ kcContext, ...props }: { kcContext: KcContextBase.LoginUpdatePassword } & KcProps) => {
    const { cx } = useCssAndCx();

    const { msg, msgStr } = useKcMessage();

    const { url, messagesPerField, isAppInitiatedAction, username } = kcContext;

    return (
        <Template
            {...{ kcContext, ...props }}
            doFetchDefaultThemeResources={true}
            headerNode={msg("updatePasswordTitle")}
            formNode={
                <form id="kc-passwd-update-form" className={cx(props.kcFormClass)} action={url.loginAction} method="post">
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        readOnly={true}
                        autoComplete="username"
                        style={{ display: "none" }}
                    />
                    <input type="password" id="password" name="password" autoComplete="current-password" style={{ display: "none" }} />

                    <div className={cx(props.kcFormGroupClass, messagesPerField.printIfExists("password", props.kcFormGroupErrorClass))}>
                        <div className={cx(props.kcLabelWrapperClass)}>
                            <label htmlFor="password-new" className={cx(props.kcLabelClass)}>
                                {msg("passwordNew")}
                            </label>
                        </div>
                        <div className={cx(props.kcInputWrapperClass)}>
                            <input
                                type="password"
                                id="password-new"
                                name="password-new"
                                autoFocus
                                autoComplete="new-password"
                                className={cx(props.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={cx(props.kcFormGroupClass, messagesPerField.printIfExists("password-confirm", props.kcFormGroupErrorClass))}>
                        <div className={cx(props.kcLabelWrapperClass)}>
                            <label htmlFor="password-confirm" className={cx(props.kcLabelClass)}>
                                {msg("passwordConfirm")}
                            </label>
                        </div>
                        <div className={cx(props.kcInputWrapperClass)}>
                            <input
                                type="password"
                                id="password-confirm"
                                name="password-confirm"
                                autoComplete="new-password"
                                className={cx(props.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={cx(props.kcFormGroupClass)}>
                        <div id="kc-form-options" className={cx(props.kcFormOptionsClass)}>
                            <div className={cx(props.kcFormOptionsWrapperClass)}>
                                {isAppInitiatedAction && (
                                    <div className="checkbox">
                                        <label>
                                            <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked />
                                            {msgStr("logoutOtherSessions")}
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div id="kc-form-buttons" className={cx(props.kcFormButtonsClass)}>
                            {isAppInitiatedAction ? (
                                <>
                                    <input
                                        className={cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonLargeClass)}
                                        type="submit"
                                        defaultValue={msgStr("doSubmit")}
                                    />
                                    <button
                                        className={cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonLargeClass)}
                                        type="submit"
                                        name="cancel-aia"
                                        value="true"
                                    >
                                        {msg("doCancel")}
                                    </button>
                                </>
                            ) : (
                                <input
                                    className={cx(
                                        props.kcButtonClass,
                                        props.kcButtonPrimaryClass,
                                        props.kcButtonBlockClass,
                                        props.kcButtonLargeClass,
                                    )}
                                    type="submit"
                                    defaultValue={msgStr("doSubmit")}
                                />
                            )}
                        </div>
                    </div>
                </form>
            }
        />
    );
});
