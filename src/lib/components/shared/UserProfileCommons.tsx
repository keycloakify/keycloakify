import React, { memo, useEffect, Fragment } from "react";
import type { KcProps } from "../KcProps";
import type { Attribute } from "../../getKcContext/KcContextBase";
import { useCssAndCx } from "../../tools/useCssAndCx";
import type { ReactComponent } from "../../tools/ReactComponent";
import { useCallbackFactory } from "powerhooks/useCallbackFactory";
import { useFormValidationSlice } from "../../useFormValidationSlice";
import type { I18n } from "../../i18n";
import type { Param0 } from "tsafe/Param0";

export type UserProfileFormFieldsProps = {
    //kcContext: KcContextBase.RegisterUserProfile;
    kcContext: Param0<typeof useFormValidationSlice>["kcContext"];
    doInsertPasswordFields: boolean;
    i18n: I18n;
} & KcProps &
    Partial<Record<"BeforeField" | "AfterField", ReactComponent<{ attribute: Attribute }>>> & {
        onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
    };

export const UserProfileFormFields = memo(
    ({ kcContext, doInsertPasswordFields, onIsFormSubmittableValueChange, i18n, BeforeField, AfterField, ...props }: UserProfileFormFieldsProps) => {
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
                {(doInsertPasswordFields ? attributesWithPassword : kcContext.profile.attributes).map((attribute, i) => {
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

                            {BeforeField && <BeforeField attribute={attribute} />}

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

                            {AfterField && <AfterField attribute={attribute} />}
                        </Fragment>
                    );
                })}
            </>
        );
    }
);
