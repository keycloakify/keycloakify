import React, { useEffect, Fragment } from "react";
import type { KcProps } from "../../KcProps";
import type { Attribute } from "../../getKcContext/KcContextBase";
import { clsx } from "../../tools/clsx";
import { useCallbackFactory } from "../../tools/useCallbackFactory";
import { useFormValidationSlice } from "../../useFormValidationSlice";
import type { I18nBase } from "../../i18n";

export type UserProfileFormFieldsProps = {
    kcContext: Parameters<typeof useFormValidationSlice>[0]["kcContext"];
    i18n: I18nBase;
} & KcProps &
    Partial<Record<"BeforeField" | "AfterField", (props: { attribute: Attribute }) => JSX.Element | null>> & {
        onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
    };

export function UserProfileFormFields({
    kcContext,
    onIsFormSubmittableValueChange,
    i18n,
    BeforeField,
    AfterField,
    ...props
}: UserProfileFormFieldsProps) {
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

                const formGroupClassName = clsx(props.kcFormGroupClass, displayableErrors.length !== 0 && props.kcFormGroupErrorClass);

                return (
                    <Fragment key={i}>
                        {group !== currentGroup && (currentGroup = group) !== "" && (
                            <div className={formGroupClassName}>
                                <div className={clsx(props.kcContentWrapperClass)}>
                                    <label id={`header-${group}`} className={clsx(props.kcFormGroupHeader)}>
                                        {advancedMsg(groupDisplayHeader) || currentGroup}
                                    </label>
                                </div>
                                {groupDisplayDescription !== "" && (
                                    <div className={clsx(props.kcLabelWrapperClass)}>
                                        <label id={`description-${group}`} className={`${clsx(props.kcLabelClass)}`}>
                                            {advancedMsg(groupDisplayDescription)}
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        {BeforeField && <BeforeField attribute={attribute} />}

                        <div className={formGroupClassName}>
                            <div className={clsx(props.kcLabelWrapperClass)}>
                                <label htmlFor={attribute.name} className={clsx(props.kcLabelClass)}>
                                    {advancedMsg(attribute.displayName ?? "")}
                                </label>
                                {attribute.required && <>*</>}
                            </div>
                            <div className={clsx(props.kcInputWrapperClass)}>
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
                                            className={clsx(props.kcInputClass)}
                                            aria-invalid={displayableErrors.length !== 0}
                                            disabled={attribute.readOnly}
                                            autoComplete={attribute.autocomplete}
                                            onBlur={onBlurFactory(attribute.name)}
                                        />
                                    );
                                })()}
                                {displayableErrors.length !== 0 &&
                                    (() => {
                                        const divId = `input-error-${attribute.name}`;

                                        return (
                                            <>
                                                <style>{`#${divId} > span: { display: block; }`}</style>
                                                <span
                                                    id={divId}
                                                    className={clsx(props.kcInputErrorMessageClass)}
                                                    style={{
                                                        "position": displayableErrors.length === 1 ? "absolute" : undefined
                                                    }}
                                                    aria-live="polite"
                                                >
                                                    {displayableErrors.map(({ errorMessage }) => errorMessage)}
                                                </span>
                                            </>
                                        );
                                    })()}
                            </div>
                        </div>

                        {AfterField && <AfterField attribute={attribute} />}
                    </Fragment>
                );
            })}
        </>
    );
}
