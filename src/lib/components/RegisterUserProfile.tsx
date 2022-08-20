import React, { useMemo, memo, useEffect, useState, Fragment } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase, Attribute } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "tss-react";
import type { ReactComponent } from "../tools/ReactComponent";
import { useCallbackFactory } from "powerhooks/useCallbackFactory";
import { useFormValidationSlice } from "../useFormValidationSlice";
import type { I18n } from "../i18n";

const RegisterUserProfile = memo(({ kcContext, i18n, ...props_ }: { kcContext: KcContextBase.RegisterUserProfile; i18n: I18n } & KcProps) => {
    const { url, messagesPerField, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const { msg, msgStr } = i18n;

    const { cx, css } = useCssAndCx();

    const props = useMemo(
        () => ({
            ...props_,
            "kcFormGroupClass": cx(props_.kcFormGroupClass, css({ "marginBottom": 20 }))
        }),
        [cx, css]
    );

    const [isFomSubmittable, setIsFomSubmittable] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, ...props }}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields={true}
            doFetchDefaultThemeResources={true}
            headerNode={msg("registerTitle")}
            formNode={
                <form id="kc-register-form" className={cx(props.kcFormClass)} action={url.registrationAction} method="post">
                    <UserProfileFormFields kcContext={kcContext} onIsFormSubmittableValueChange={setIsFomSubmittable} i18n={i18n} {...props} />
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
                                disabled={!isFomSubmittable}
                            />
                        </div>
                    </div>
                </form>
            }
        />
    );
});

type UserProfileFormFieldsProps = { kcContext: KcContextBase.RegisterUserProfile; i18n: I18n } & KcProps &
    Partial<Record<"BeforeField" | "AfterField", ReactComponent<{ attribute: Attribute }>>> & {
        onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
    };

const UserProfileFormFields = memo(({ kcContext, onIsFormSubmittableValueChange, i18n, ...props }: UserProfileFormFieldsProps) => {
    const { cx, css } = useCssAndCx();

    const { advancedMsg } = i18n;

    const {
        formValidationState: { fieldStateByAttributeName, isFormSubmittable },
        formValidationReducer,
        attributesWithPassword
    } = useFormValidationSlice({
        kcContext,
        i18n
    });

    useEffect(() => {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable]);

    const onChangeFactory = useCallbackFactory(
        (
            [name]: [string],
            [
                {
                    target: { value }
                }
            ]: [React.ChangeEvent<HTMLInputElement | HTMLSelectElement>]
        ) =>
            formValidationReducer({
                "action": "update value",
                name,
                "newValue": value
            })
    );

    const onBlurFactory = useCallbackFactory(([name]: [string]) =>
        formValidationReducer({
            "action": "focus lost",
            name
        })
    );

    let currentGroup = "";

    return (
        <>
            {attributesWithPassword.map((attribute, i) => {
                const { group = "", groupDisplayHeader = "", groupDisplayDescription = "" } = attribute;

                const { value, displayableErrors } = fieldStateByAttributeName[attribute.name];

                const formGroupClassName = cx(props.kcFormGroupClass, displayableErrors.length !== 0 && props.kcFormGroupErrorClass);

                return (
                    <Fragment key={i}>
                        {group !== currentGroup && (currentGroup = group) !== "" && (
                            <div className={formGroupClassName}>
                                <div className={cx(props.kcContentWrapperClass)}>
                                    <label id={`header-${group}`} className={cx(props.kcFormGroupHeader)}>
                                        {advancedMsg(groupDisplayHeader) || currentGroup}
                                    </label>
                                </div>
                                {groupDisplayDescription !== "" && (
                                    <div className={cx(props.kcLabelWrapperClass)}>
                                        <label id={`description-${group}`} className={`${cx(props.kcLabelClass)}`}>
                                            {advancedMsg(groupDisplayDescription)}
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={formGroupClassName}>
                            <div className={cx(props.kcLabelWrapperClass)}>
                                <label htmlFor={attribute.name} className={cx(props.kcLabelClass)}>
                                    {advancedMsg(attribute.displayName ?? "")}
                                </label>
                                {attribute.required && <>*</>}
                            </div>
                            <div className={cx(props.kcInputWrapperClass)}>
                                {(() => {
                                    const { options } = attribute.validators;

                                    if (options !== undefined) {
                                        return (
                                            <select
                                                id={attribute.name}
                                                name={attribute.name}
                                                onChange={onChangeFactory(attribute.name)}
                                                onBlur={onBlurFactory(attribute.name)}
                                                value={value}
                                            >
                                                {options.options.map(option => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        );
                                    }

                                    return (
                                        <input
                                            type={(() => {
                                                switch (attribute.name) {
                                                    case "password-confirm":
                                                    case "password":
                                                        return "password";
                                                    default:
                                                        return "text";
                                                }
                                            })()}
                                            id={attribute.name}
                                            name={attribute.name}
                                            value={value}
                                            onChange={onChangeFactory(attribute.name)}
                                            className={cx(props.kcInputClass)}
                                            aria-invalid={displayableErrors.length !== 0}
                                            disabled={attribute.readOnly}
                                            autoComplete={attribute.autocomplete}
                                            onBlur={onBlurFactory(attribute.name)}
                                        />
                                    );
                                })()}
                                {displayableErrors.length !== 0 && (
                                    <span
                                        id={`input-error-${attribute.name}`}
                                        className={cx(
                                            props.kcInputErrorMessageClass,
                                            css({
                                                "position": displayableErrors.length === 1 ? "absolute" : undefined,
                                                "& > span": { "display": "block" }
                                            })
                                        )}
                                        aria-live="polite"
                                    >
                                        {displayableErrors.map(({ errorMessage }) => errorMessage)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Fragment>
                );
            })}
        </>
    );
});

export default RegisterUserProfile;
