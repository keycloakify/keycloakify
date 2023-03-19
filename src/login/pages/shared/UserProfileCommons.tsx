import { useEffect, Fragment } from "react";
import type { ClassKey } from "keycloakify/login/pages/PageProps";
import { clsx } from "keycloakify/tools/clsx";
import { useFormValidation } from "keycloakify/login/lib/useFormValidation";
import type { Attribute } from "keycloakify/login/kcContext/KcContext";
import type { I18n } from "../../i18n";

export type UserProfileFormFieldsProps = {
    kcContext: Parameters<typeof useFormValidation>[0]["kcContext"];
    i18n: I18n;
    getClassName: (classKey: ClassKey) => string;
    onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
    BeforeField?: (props: { attribute: Attribute }) => JSX.Element | null;
    AfterField?: (props: { attribute: Attribute }) => JSX.Element | null;
};

export function UserProfileFormFields(props: UserProfileFormFieldsProps) {
    const { kcContext, onIsFormSubmittableValueChange, i18n, getClassName, BeforeField, AfterField } = props;

    const { advancedMsg } = i18n;

    const {
        formValidationState: { fieldStateByAttributeName, isFormSubmittable },
        formValidationDispatch,
        attributesWithPassword
    } = useFormValidation({
        kcContext,
        i18n
    });

    useEffect(() => {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable]);

    let currentGroup = "";

    return (
        <>
            {attributesWithPassword.map((attribute, i) => {
                const { group = "", groupDisplayHeader = "", groupDisplayDescription = "" } = attribute;

                const { value, displayableErrors } = fieldStateByAttributeName[attribute.name];

                const formGroupClassName = clsx(
                    getClassName("kcFormGroupClass"),
                    displayableErrors.length !== 0 && getClassName("kcFormGroupErrorClass")
                );

                return (
                    <Fragment key={i}>
                        {group !== currentGroup && (currentGroup = group) !== "" && (
                            <div className={formGroupClassName}>
                                <div className={getClassName("kcContentWrapperClass")}>
                                    <label id={`header-${group}`} className={getClassName("kcFormGroupHeader")}>
                                        {advancedMsg(groupDisplayHeader) || currentGroup}
                                    </label>
                                </div>
                                {groupDisplayDescription !== "" && (
                                    <div className={getClassName("kcLabelWrapperClass")}>
                                        <label id={`description-${group}`} className={getClassName("kcLabelClass")}>
                                            {advancedMsg(groupDisplayDescription)}
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        {BeforeField && <BeforeField attribute={attribute} />}

                        <div className={formGroupClassName}>
                            <div className={getClassName("kcLabelWrapperClass")}>
                                <label htmlFor={attribute.name} className={getClassName("kcLabelClass")}>
                                    {advancedMsg(attribute.displayName ?? "")}
                                </label>
                                {attribute.required && <>*</>}
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                {(() => {
                                    const { options } = attribute.validators;

                                    if (options !== undefined) {
                                        return (
                                            <select
                                                id={attribute.name}
                                                name={attribute.name}
                                                onChange={event =>
                                                    formValidationDispatch({
                                                        "action": "update value",
                                                        "name": attribute.name,
                                                        "newValue": event.target.value
                                                    })
                                                }
                                                onBlur={() =>
                                                    formValidationDispatch({
                                                        "action": "focus lost",
                                                        "name": attribute.name
                                                    })
                                                }
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
                                            onChange={event =>
                                                formValidationDispatch({
                                                    "action": "update value",
                                                    "name": attribute.name,
                                                    "newValue": event.target.value
                                                })
                                            }
                                            onBlur={() =>
                                                formValidationDispatch({
                                                    "action": "focus lost",
                                                    "name": attribute.name
                                                })
                                            }
                                            className={getClassName("kcInputClass")}
                                            aria-invalid={displayableErrors.length !== 0}
                                            disabled={attribute.readOnly}
                                            autoComplete={attribute.autocomplete}
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
                                                    className={getClassName("kcInputErrorMessageClass")}
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
