import { useEffect, Fragment } from "react";
import type { ClassKey } from "keycloakify/login/TemplateProps";
import { clsx } from "keycloakify/tools/clsx";
import { useProfileAttributeForm, type KcContextLike } from "keycloakify/login/lib/useProfileAttributeForm";
import type { Attribute, LegacyAttribute } from "keycloakify/login/kcContext/KcContext";
import type { I18n } from "../../i18n";
import { assert } from "tsafe/assert";

export type UserProfileFormFieldsProps = {
    kcContext: KcContextLike;
    i18n: I18n;
    getClassName: (classKey: ClassKey) => string;
    onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
    BeforeField?: (props: { attribute: Attribute }) => JSX.Element | null;
    AfterField?: (props: { attribute: Attribute }) => JSX.Element | null;
};

export function UserProfileFormFields(props: UserProfileFormFieldsProps) {
    const { kcContext, onIsFormSubmittableValueChange, i18n, getClassName, BeforeField, AfterField } = props;

    const { advancedMsg, msg } = i18n;

    const {
        formValidationState: { fieldStateByAttributeName, isFormSubmittable },
        formValidationDispatch,
        attributesWithPassword
    } = useProfileAttributeForm({
        kcContext,
        i18n
        // NOTE: Uncomment the following line if you don't want for force the user to enter the password twice.
        //"requirePasswordConfirmation": false
    });

    useEffect(() => {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable]);

    let currentGroupName = "";

    return (
        <>
            {attributesWithPassword.map((attribute, i) => {
                const { displayableErrors, value } = fieldStateByAttributeName[attribute.name];

                const formGroupClassName = clsx(
                    getClassName("kcFormGroupClass"),
                    displayableErrors.length !== 0 && getClassName("kcFormGroupErrorClass")
                );

                return (
                    <Fragment key={i}>
                        {(() => {
                            keycloak_prior_to_24: {
                                if (attribute.html5DataAnnotations !== undefined) {
                                    break keycloak_prior_to_24;
                                }

                                const { group = "", groupDisplayHeader = "", groupDisplayDescription = "" } = attribute as any as LegacyAttribute;

                                return (
                                    group !== currentGroupName &&
                                    (currentGroupName = group) !== "" && (
                                        <div className={formGroupClassName}>
                                            <div className={getClassName("kcContentWrapperClass")}>
                                                <label id={`header-${group}`} className={getClassName("kcFormGroupHeader")}>
                                                    {advancedMsg(groupDisplayHeader) || currentGroupName}
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
                                    )
                                );
                            }

                            if (attribute.group?.name !== currentGroupName) {
                                currentGroupName = attribute.group?.name ?? "";

                                if (currentGroupName !== "") {
                                    assert(attribute.group !== undefined);

                                    return (
                                        <div
                                            className={getClassName("kcFormGroupClass")}
                                            {...Object.fromEntries(
                                                Object.entries(attribute.group.html5DataAnnotations).map(([key, value]) => [`data-${key}`, value])
                                            )}
                                        >
                                            {(() => {
                                                const groupDisplayHeader = attribute.group.displayHeader ?? "";
                                                const groupHeaderText =
                                                    groupDisplayHeader !== "" ? advancedMsg(groupDisplayHeader) : attribute.group.name;

                                                return (
                                                    <div className={getClassName("kcContentWrapperClass")}>
                                                        <label id={`header-${attribute.group.name}`} className={getClassName("kcFormGroupHeader")}>
                                                            {groupHeaderText}
                                                        </label>
                                                    </div>
                                                );
                                            })()}
                                            {(() => {
                                                const groupDisplayDescription = attribute.group.displayDescription ?? "";

                                                if (groupDisplayDescription !== "") {
                                                    const groupDescriptionText = advancedMsg(groupDisplayDescription);

                                                    return (
                                                        <div className={getClassName("kcLabelWrapperClass")}>
                                                            <label
                                                                id={`description-${attribute.group.name}`}
                                                                className={getClassName("kcLabelClass")}
                                                            >
                                                                {groupDescriptionText}
                                                            </label>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })()}
                                        </div>
                                    );
                                }
                            }

                            return null;
                        })()}

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
                                                <>
                                                    <option value="" selected disabled hidden>
                                                        {msg("selectAnOption")}
                                                    </option>
                                                    {options.options.map(option => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </>
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
