import { memo, Fragment } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useKcMessage } from "../i18n/useKcMessage";
import { useCssAndCx } from "tss-react";
import type { ReactComponent } from "../tools/ReactComponent";

export const RegisterUserProfile = memo(({ kcContext, ...props }: { kcContext: KcContextBase.RegisterUserProfile } & KcProps) => {
    const { url, messagesPerField, realm, passwordRequired, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const { msg, msgStr } = useKcMessage();

    const { cx } = useCssAndCx();

    return (
        <Template
            {...{ kcContext, ...props }}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields={true}
            doFetchDefaultThemeResources={true}
            headerNode={msg("registerTitle")}
            formNode={
                <form id="kc-register-form" className={cx(props.kcFormClass)} action={url.registrationAction} method="post">
                    <UserProfileFormFields
                        kcContext={kcContext}
                        {...props}
                        AfterField={({ attribute }) =>
                            /*render password fields just under the username or email (if used as username)*/
                            (passwordRequired &&
                                (attribute.name == "username" || (attribute.name == "email" && realm.registrationEmailAsUsername)) && (
                                    <>
                                        <div className={cx(props.kcFormGroupClass)}>
                                            <div className={cx(props.kcLabelWrapperClass)}>
                                                <label htmlFor="password" className={cx(props.kcLabelClass)}>
                                                    {msg("password")}
                                                </label>{" "}
                                                *
                                            </div>
                                            <div className={cx(props.kcInputWrapperClass)}>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    className={cx(props.kcInputClass)}
                                                    name="password"
                                                    autoComplete="new-password"
                                                    aria-invalid={
                                                        messagesPerField.existsError("password") || messagesPerField.existsError("password-confirm")
                                                    }
                                                />
                                                {messagesPerField.existsError("password") && (
                                                    <span id="input-error-password" className={cx(props.kcInputErrorMessageClass)} aria-live="polite">
                                                        {messagesPerField.get("password")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={cx(props.kcFormGroupClass)}>
                                            <div className={cx(props.kcLabelWrapperClass)}>
                                                <label htmlFor="password-confirm" className={cx(props.kcLabelClass)}>
                                                    {msg("passwordConfirm")}
                                                </label>{" "}
                                                *
                                            </div>
                                            <div className={cx(props.kcInputWrapperClass)}>
                                                <input
                                                    type="password"
                                                    id="password-confirm"
                                                    className={cx(props.kcInputClass)}
                                                    name="password-confirm"
                                                    autoComplete="new-password"
                                                    aria-invalid={messagesPerField.existsError("password-confirm")}
                                                />
                                                {messagesPerField.existsError("password-confirm") && (
                                                    <span
                                                        id="input-error-password-confirm"
                                                        className={cx(props.kcInputErrorMessageClass)}
                                                        aria-live="polite"
                                                    >
                                                        {messagesPerField.get("password-confirm")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )) ||
                            null
                        }
                    />
                    {recaptchaRequired && (
                        <div className="form-group">
                            <div className={cx(props.kcInputWrapperClass)}>
                                <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} />
                            </div>
                        </div>
                    )}
                    <div className={cx(props.kcFormGroupClass)}>
                        <div id="kc-form-options" className={cx(props.kcFormOptionsClass)}>
                            <div className={cx(props.kcFormOptionsWrapperClass)}>
                                <span>
                                    <a href={url.loginUrl}>{msg("backToLogin")}</a>
                                </span>
                            </div>
                        </div>

                        <div id="kc-form-buttons" className={cx(props.kcFormButtonsClass)}>
                            <input
                                className={cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass)}
                                type="submit"
                                value={msgStr("doRegister")}
                            />
                        </div>
                    </div>
                </form>
            }
        />
    );
});

const UserProfileFormFields = memo(
    ({
        kcContext,
        BeforeField = () => null,
        AfterField = () => null,
        ...props
    }: { kcContext: KcContextBase.RegisterUserProfile } & KcProps &
        Partial<
            Record<
                "BeforeField" | "AfterField",
                ReactComponent<{
                    attribute: KcContextBase.RegisterUserProfile["profile"]["attributes"][number];
                }>
            >
        >) => {
        const { messagesPerField } = kcContext;

        const { cx } = useCssAndCx();

        const { advancedMsg } = useKcMessage();

        let currentGroup = "";

        return (
            <>
                {kcContext.profile.attributes
                    .map(attribute => [attribute, attribute])
                    .map(([attribute, { group = "", groupDisplayHeader = "", groupDisplayDescription = "" }], i) => (
                        <Fragment key={i}>
                            {group !== currentGroup && (currentGroup = group) !== "" && (
                                <div className={cx(props.kcFormGroupClass)}>
                                    <div className={cx(props.kcContentWrapperClass)}>
                                        <label id={`header-${group}`} className={cx(props.kcFormGroupHeader)}>
                                            {(groupDisplayHeader !== "" && advancedMsg(groupDisplayHeader)) || currentGroup}
                                        </label>
                                    </div>
                                    {groupDisplayDescription !== "" && (
                                        <div className={cx(props.kcLabelWrapperClass)}>
                                            <label id={`description-${group}`} className={`${cx(props.kcLabelClass)}`}>
                                                {advancedMsg(groupDisplayDescription) ?? ""}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                            <BeforeField attribute={attribute} />
                            <div className={cx(props.kcFormGroupClass)}>
                                <div className={cx(props.kcLabelWrapperClass)}>
                                    <label htmlFor={attribute.name} className={cx(props.kcLabelClass)}>
                                        {advancedMsg(attribute.displayName ?? "")}
                                    </label>
                                    {attribute.required && <>*</>}
                                </div>
                                <div className={cx(props.kcInputWrapperClass)}>
                                    <input
                                        type="text"
                                        id={attribute.name}
                                        name={attribute.name}
                                        defaultValue={attribute.value ?? ""}
                                        className={cx(props.kcInputClass)}
                                        aria-invalid={messagesPerField.existsError(attribute.name)}
                                        disabled={attribute.readOnly}
                                        {...(attribute.autocomplete === undefined
                                            ? {}
                                            : {
                                                  "autoComplete": attribute.autocomplete,
                                              })}
                                    />
                                    {kcContext.messagesPerField.existsError(attribute.name) && (
                                        <span id={`input-error-${attribute.name}`} className={cx(props.kcInputErrorMessageClass)} aria-live="polite">
                                            {messagesPerField.get(attribute.name)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <AfterField attribute={attribute} />
                        </Fragment>
                    ))}
            </>
        );
    },
);
