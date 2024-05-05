import { useEffect, Fragment } from "react";
import type { ClassKey } from "keycloakify/login/TemplateProps";
import { clsx } from "keycloakify/tools/clsx";
import { useUserProfileForm, type KcContextLike, type FormAction, type FormFieldError } from "keycloakify/login/lib/useUserProfileForm";
import type { Attribute, LegacyAttribute } from "keycloakify/login/kcContext/KcContext";
import type { I18n } from "../../i18n";
import { assert } from "tsafe/assert";

export type UserProfileFormFieldsProps = {
    kcContext: KcContextLike;
    i18n: I18n;
    getClassName: (classKey: ClassKey) => string;
    onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
    BeforeField?: (props: BeforeAfterFieldProps) => JSX.Element | null;
    AfterField?: (props: BeforeAfterFieldProps) => JSX.Element | null;
};

type BeforeAfterFieldProps = {
    attribute: Attribute;
    dispatchFormAction: React.Dispatch<FormAction>;
    displayableErrors: FormFieldError[];
    i18n: I18n;
    valueOrValues: string | string[];
};

// NOTE: Enabled by default but it's a UX best practice to set it to false.
const doMakeUserConfirmPassword = true;

export function UserProfileFormFields(props: UserProfileFormFieldsProps) {
    const { kcContext, onIsFormSubmittableValueChange, i18n, getClassName, BeforeField, AfterField } = props;

    const { advancedMsg } = i18n;

    const {
        formState: { formFieldStates, isFormSubmittable },
        dispatchFormAction
    } = useUserProfileForm({
        kcContext,
        i18n,
        doMakeUserConfirmPassword
    });

    useEffect(() => {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable]);

    const groupNameRef = { "current": "" };

    return (
        <>
            {formFieldStates.map(({ attribute, displayableErrors, valueOrValues }) => {
                const formGroupClassName = clsx(
                    getClassName("kcFormGroupClass"),
                    displayableErrors.length !== 0 && getClassName("kcFormGroupErrorClass")
                );

                return (
                    <Fragment key={attribute.name}>
                        <GroupLabel
                            attribute={attribute}
                            getClassName={getClassName}
                            i18n={i18n}
                            groupNameRef={groupNameRef}
                            formGroupClassName={formGroupClassName}
                        />
                        {BeforeField !== undefined && (
                            <BeforeField
                                attribute={attribute}
                                dispatchFormAction={dispatchFormAction}
                                displayableErrors={displayableErrors}
                                i18n={i18n}
                                valueOrValues={valueOrValues}
                            />
                        )}
                        <div
                            className={formGroupClassName}
                            style={{ "display": attribute.name === "password-confirm" && !doMakeUserConfirmPassword ? "none" : undefined }}
                        >
                            <div className={getClassName("kcLabelWrapperClass")}>
                                <label htmlFor={attribute.name} className={getClassName("kcLabelClass")}>
                                    {advancedMsg(attribute.displayName ?? "")}
                                </label>
                                {attribute.required && <>*</>}
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                {attribute.annotations.inputHelperTextBefore !== undefined && (
                                    <div
                                        className={getClassName("kcInputHelperTextBeforeClass")}
                                        id={`form-help-text-before-${attribute.name}`}
                                        aria-live="polite"
                                    >
                                        {advancedMsg(attribute.annotations.inputHelperTextBefore)}
                                    </div>
                                )}
                                <InputFiledByType
                                    attribute={attribute}
                                    valueOrValues={valueOrValues}
                                    displayableErrors={displayableErrors}
                                    formValidationDispatch={dispatchFormAction}
                                    getClassName={getClassName}
                                    i18n={i18n}
                                />
                                <FieldErrors
                                    attribute={attribute}
                                    getClassName={getClassName}
                                    displayableErrors={displayableErrors}
                                    fieldIndex={undefined}
                                />
                                {attribute.annotations.inputHelperTextAfter !== undefined && (
                                    <div
                                        className={getClassName("kcInputHelperTextAfterClass")}
                                        id={`form-help-text-after-${attribute.name}`}
                                        aria-live="polite"
                                    >
                                        {advancedMsg(attribute.annotations.inputHelperTextAfter)}
                                    </div>
                                )}

                                {AfterField !== undefined && (
                                    <AfterField
                                        attribute={attribute}
                                        dispatchFormAction={dispatchFormAction}
                                        displayableErrors={displayableErrors}
                                        i18n={i18n}
                                        valueOrValues={valueOrValues}
                                    />
                                )}
                                {/* 
                        TODO: 

                        	<#list profile.html5DataAnnotations?keys as key>
		                        <script type="module" src="${url.resourcesPath}/js/${key}.js"></script>
	                        </#list>

                        */}
                            </div>
                        </div>
                    </Fragment>
                );
            })}
        </>
    );
}

function GroupLabel(props: {
    attribute: Attribute;
    getClassName: UserProfileFormFieldsProps["getClassName"];
    i18n: I18n;
    groupNameRef: {
        current: string;
    };
    formGroupClassName: string;
}) {
    const { attribute, getClassName, i18n, groupNameRef, formGroupClassName } = props;

    const { advancedMsg } = i18n;

    keycloak_prior_to_24: {
        if (attribute.html5DataAnnotations !== undefined) {
            break keycloak_prior_to_24;
        }

        const { group = "", groupDisplayHeader = "", groupDisplayDescription = "" } = attribute as any as LegacyAttribute;

        return (
            <>
                {group !== groupNameRef.current && (groupNameRef.current = group) !== "" && (
                    <div className={formGroupClassName}>
                        <div className={getClassName("kcContentWrapperClass")}>
                            <label id={`header-${group}`} className={getClassName("kcFormGroupHeader")}>
                                {advancedMsg(groupDisplayHeader) || groupNameRef.current}
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
            </>
        );
    }

    if (attribute.group?.name !== groupNameRef.current) {
        groupNameRef.current = attribute.group?.name ?? "";

        if (groupNameRef.current !== "") {
            assert(attribute.group !== undefined);

            return (
                <div
                    className={getClassName("kcFormGroupClass")}
                    {...Object.fromEntries(Object.entries(attribute.group.html5DataAnnotations).map(([key, value]) => [`data-${key}`, value]))}
                >
                    {(() => {
                        const groupDisplayHeader = attribute.group.displayHeader ?? "";
                        const groupHeaderText = groupDisplayHeader !== "" ? advancedMsg(groupDisplayHeader) : attribute.group.name;

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
                                    <label id={`description-${attribute.group.name}`} className={getClassName("kcLabelClass")}>
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
}

function FieldErrors(props: {
    attribute: Attribute;
    getClassName: UserProfileFormFieldsProps["getClassName"];
    displayableErrors: FormFieldError[];
    fieldIndex: number | undefined;
}) {
    const { attribute, getClassName, fieldIndex } = props;

    const displayableErrors = props.displayableErrors.filter(error => error.fieldIndex === fieldIndex);

    if (displayableErrors.length === 0) {
        return null;
    }

    return (
        <span
            id={`input-error-${attribute.name}${fieldIndex === undefined ? "" : `-${fieldIndex}`}`}
            className={getClassName("kcInputErrorMessageClass")}
            style={{
                "position": displayableErrors.length === 1 ? "absolute" : undefined
            }}
            aria-live="polite"
        >
            {displayableErrors
                .filter(error => error.fieldIndex === fieldIndex)
                .map(({ errorMessage }, i, arr) => (
                    <>
                        <span key={i}>{errorMessage}</span>
                        {arr.length - 1 !== i && <br />}
                    </>
                ))}
        </span>
    );
}

type PropsOfInputFiledByType = {
    attribute: Attribute;
    valueOrValues: string | string[];
    displayableErrors: FormFieldError[];
    formValidationDispatch: React.Dispatch<FormAction>;
    getClassName: UserProfileFormFieldsProps["getClassName"];
    i18n: I18n;
};

function InputFiledByType(props: PropsOfInputFiledByType) {
    const { attribute, valueOrValues } = props;

    /*
    <#macro inputFieldByType attribute>
    <#switch attribute.annotations.inputType!''>
    <#case 'textarea'>
        <@textareaTag attribute=attribute/>
        <#break>
    <#case 'select'>
    <#case 'multiselect'>
        <@selectTag attribute=attribute/>
        <#break>
    <#case 'select-radiobuttons'>
    <#case 'multiselect-checkboxes'>
        <@inputTagSelects attribute=attribute/>
        <#break>
    <#default>
        <#if attribute.multivalued && attribute.values?has_content>
            <#list attribute.values as value>
                <@inputTag attribute=attribute value=value!''/>
            </#list>
        <#else>
            <@inputTag attribute=attribute value=attribute.value!''/>
        </#if>
    </#switch>
    </#macro>
    */

    switch (attribute.annotations.inputType) {
        case "textarea":
            return <TextareaTag {...props} />;
        case "select":
        case "multiselect":
            return <SelectTag {...props} />;
        case "select-radiobuttons":
        case "multiselect-checkboxes":
            return <InputTagSelects {...props} />;
        default:
            if (valueOrValues instanceof Array) {
                return (
                    <>
                        {valueOrValues.map((...[, i]) => (
                            <InputTag key={i} {...props} fieldIndex={i} />
                        ))}
                    </>
                );
            }

            return <InputTag {...props} fieldIndex={undefined} />;
    }
}

function InputTag(props: PropsOfInputFiledByType & { fieldIndex: number | undefined }) {
    /*
    <#macro inputTag attribute value>
    <input type="<@inputTagType attribute=attribute/>" id="${attribute.name}" name="${attribute.name}" value="${(value!'')}" class="${properties.kcInputClass!}"
        aria-invalid="<#if messagesPerField.existsError('${attribute.name}')>true</#if>"
        <#if attribute.readOnly>disabled</#if>
        <#if attribute.autocomplete??>autocomplete="${attribute.autocomplete}"</#if>
        <#if attribute.annotations.inputTypePlaceholder??>placeholder="${attribute.annotations.inputTypePlaceholder}"</#if>
        <#if attribute.annotations.inputTypePattern??>pattern="${attribute.annotations.inputTypePattern}"</#if>
        <#if attribute.annotations.inputTypeSize??>size="${attribute.annotations.inputTypeSize}"</#if>
        <#if attribute.annotations.inputTypeMaxlength??>maxlength="${attribute.annotations.inputTypeMaxlength}"</#if>
        <#if attribute.annotations.inputTypeMinlength??>minlength="${attribute.annotations.inputTypeMinlength}"</#if>
        <#if attribute.annotations.inputTypeMax??>max="${attribute.annotations.inputTypeMax}"</#if>
        <#if attribute.annotations.inputTypeMin??>min="${attribute.annotations.inputTypeMin}"</#if>
        <#if attribute.annotations.inputTypeStep??>step="${attribute.annotations.inputTypeStep}"</#if>
        <#if attribute.annotations.inputTypeStep??>step="${attribute.annotations.inputTypeStep}"</#if>
        <#list attribute.html5DataAnnotations as key, value>
            data-${key}="${value}"
        </#list>
    />
    </#macro>

    <#macro inputTagType attribute>
    <#compress>
    <#if attribute.annotations.inputType??>
        <#if attribute.annotations.inputType?starts_with("html5-")>
            ${attribute.annotations.inputType[6..]}
        <#else>
            ${attribute.annotations.inputType}
        </#if>
    <#else>
    text
    </#if>
    </#compress>
    </#macro>

    */

    const { attribute, fieldIndex, getClassName, formValidationDispatch, valueOrValues, i18n, displayableErrors } = props;

    return (
        <>
            <input
                type={(() => {
                    const { inputType } = attribute.annotations;

                    if (inputType?.startsWith("html5-")) {
                        return inputType.slice(6);
                    }

                    return inputType ?? "text";
                })()}
                id={attribute.name}
                name={attribute.name}
                value={(() => {
                    if (fieldIndex !== undefined) {
                        assert(valueOrValues instanceof Array);
                        return valueOrValues[fieldIndex];
                    }

                    assert(typeof valueOrValues === "string");

                    return valueOrValues;
                })()}
                className={getClassName("kcInputClass")}
                aria-invalid={displayableErrors.find(error => error.fieldIndex === fieldIndex) !== undefined}
                disabled={attribute.readOnly}
                autoComplete={attribute.autocomplete}
                placeholder={attribute.annotations.inputTypePlaceholder}
                pattern={attribute.annotations.inputTypePattern}
                size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(attribute.annotations.inputTypeSize)}
                maxLength={attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(attribute.annotations.inputTypeMaxlength)}
                minLength={attribute.annotations.inputTypeMinlength === undefined ? undefined : parseInt(attribute.annotations.inputTypeMinlength)}
                max={attribute.annotations.inputTypeMax}
                min={attribute.annotations.inputTypeMin}
                step={attribute.annotations.inputTypeStep}
                //{...Object.fromEntries(Object.entries(props.attribute.html5DataAnnotations).map(([key, value]) => [`data-${key}`, value])}
                onChange={event =>
                    formValidationDispatch({
                        "action": "update",
                        "name": attribute.name,
                        "valueOrValues": (() => {
                            if (fieldIndex !== undefined) {
                                assert(valueOrValues instanceof Array);

                                return valueOrValues.map((value, i) => {
                                    if (i === fieldIndex) {
                                        return event.target.value;
                                    }

                                    return value;
                                });
                            }

                            return event.target.value;
                        })()
                    })
                }
                onBlur={() =>
                    props.formValidationDispatch({
                        "action": "focus lost",
                        "name": attribute.name,
                        "fieldIndex": fieldIndex
                    })
                }
            />
            {(() => {
                if (fieldIndex === undefined) {
                    return null;
                }

                assert(valueOrValues instanceof Array);

                const values = valueOrValues;

                return (
                    <>
                        <FieldErrors
                            attribute={attribute}
                            getClassName={getClassName}
                            displayableErrors={displayableErrors}
                            fieldIndex={fieldIndex}
                        />
                        <AddRemoveButtonsMultiValuedAttribute
                            attribute={attribute}
                            values={values}
                            fieldIndex={fieldIndex}
                            dispatchFormAction={formValidationDispatch}
                            i18n={i18n}
                        />
                    </>
                );
            })()}
        </>
    );
}

function AddRemoveButtonsMultiValuedAttribute(props: {
    attribute: Attribute;
    values: string[];
    fieldIndex: number;
    dispatchFormAction: React.Dispatch<Extract<FormAction, { action: "update" }>>;
    i18n: I18n;
}) {
    const { attribute, values, fieldIndex, dispatchFormAction, i18n } = props;

    const { msg } = i18n;

    const hasRemove = (() => {
        if (values.length === 1) {
            return false;
        }

        const minCount = (() => {
            const { multivalued } = attribute.validators;

            if (multivalued === undefined) {
                return undefined;
            }

            const minStr = multivalued.min;

            if (minStr === undefined) {
                return undefined;
            }

            return parseInt(minStr);
        })();

        if (minCount === undefined) {
            return true;
        }

        if (values.length === minCount) {
            return false;
        }

        return true;
    })();

    const hasAdd = (() => {
        if (fieldIndex + 1 !== values.length) {
            return false;
        }

        const maxCount = (() => {
            const { multivalued } = attribute.validators;

            if (multivalued === undefined) {
                return undefined;
            }

            const maxStr = multivalued.max;

            if (maxStr === undefined) {
                return undefined;
            }

            return parseInt(maxStr);
        })();

        if (maxCount === undefined) {
            return false;
        }

        if (values.length === maxCount) {
            return false;
        }

        return true;
    })();

    return (
        <>
            {hasRemove && (
                <button
                    id={`kc-remove-${attribute.name}-${fieldIndex + 1}`}
                    type="button"
                    className="pf-c-button pf-m-inline pf-m-link"
                    onClick={() =>
                        dispatchFormAction({
                            "action": "update",
                            "name": attribute.name,
                            "valueOrValues": values.filter((_, i) => i !== fieldIndex)
                        })
                    }
                >
                    {msg("remove")}
                    {hasRemove ? <>&nbsp;|&nbsp;</> : null}
                </button>
            )}
            {hasAdd && (
                <button
                    id="kc-add-titles-1"
                    type="button"
                    className="pf-c-button pf-m-inline pf-m-link"
                    onClick={() =>
                        dispatchFormAction({
                            "action": "update",
                            "name": attribute.name,
                            "valueOrValues": [...values, ""]
                        })
                    }
                >
                    {msg("addValue")}
                </button>
            )}
        </>
    );
}

function InputTagSelects(props: PropsOfInputFiledByType) {
    /*
<#macro inputTagSelects attribute>
    <#if attribute.annotations.inputType=='select-radiobuttons'>
        <#assign inputType='radio'>
        <#assign classDiv=properties.kcInputClassRadio!>
        <#assign classInput=properties.kcInputClassRadioInput!>
        <#assign classLabel=properties.kcInputClassRadioLabel!>
    <#else>
        <#assign inputType='checkbox'>
        <#assign classDiv=properties.kcInputClassCheckbox!>
        <#assign classInput=properties.kcInputClassCheckboxInput!>
        <#assign classLabel=properties.kcInputClassCheckboxLabel!>
    </#if>

    <#if attribute.annotations.inputOptionsFromValidation?? && attribute.validators[attribute.annotations.inputOptionsFromValidation]?? && attribute.validators[attribute.annotations.inputOptionsFromValidation].options??>
        <#assign options=attribute.validators[attribute.annotations.inputOptionsFromValidation].options>
    <#elseif attribute.validators.options?? && attribute.validators.options.options??>
        <#assign options=attribute.validators.options.options>
    <#else>
        <#assign options=[]>
    </#if>

    <#list options as option>
        <div class="${classDiv}">
            <input type="${inputType}" id="${attribute.name}-${option}" name="${attribute.name}" value="${option}" class="${classInput}"
                aria-invalid="<#if messagesPerField.existsError('${attribute.name}')>true</#if>"
                <#if attribute.readOnly>disabled</#if>
                <#if attribute.values?seq_contains(option)>checked</#if>
            />
            <label for="${attribute.name}-${option}" class="${classLabel}<#if attribute.readOnly> ${properties.kcInputClassRadioCheckboxLabelDisabled!}</#if>"><@selectOptionLabelText attribute=attribute option=option/></label>
        </div>
    </#list>
</#macro>
    */

    const { attribute, formValidationDispatch, getClassName, valueOrValues } = props;

    const { advancedMsg } = props.i18n;

    const { classDiv, classInput, classLabel, inputType } = (() => {
        const { inputType } = attribute.annotations;

        assert(inputType === "select-radiobuttons" || inputType === "multiselect-checkboxes");

        switch (inputType) {
            case "select-radiobuttons":
                return {
                    "inputType": "radio",
                    "classDiv": getClassName("kcInputClassRadio"),
                    "classInput": getClassName("kcInputClassRadioInput"),
                    "classLabel": getClassName("kcInputClassRadioLabel")
                };
            case "multiselect-checkboxes":
                return {
                    "inputType": "checkbox",
                    "classDiv": getClassName("kcInputClassCheckbox"),
                    "classInput": getClassName("kcInputClassCheckboxInput"),
                    "classLabel": getClassName("kcInputClassCheckboxLabel")
                };
        }
    })();

    const options = (() => {
        walk: {
            const { inputOptionsFromValidation } = attribute.annotations;

            if (inputOptionsFromValidation === undefined) {
                break walk;
            }

            const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];

            if (validator === undefined) {
                break walk;
            }

            if (validator.options === undefined) {
                break walk;
            }

            return validator.options;
        }

        return attribute.validators.options?.options ?? [];
    })();

    return (
        <>
            {options.map(option => (
                <div key={option} className={classDiv}>
                    <input
                        type={inputType}
                        id={`${attribute.name}-${option}`}
                        name={attribute.name}
                        value={option}
                        className={classInput}
                        aria-invalid={props.displayableErrors.length !== 0}
                        disabled={attribute.readOnly}
                        checked={valueOrValues.includes(option)}
                        onChange={event =>
                            formValidationDispatch({
                                "action": "update",
                                "name": attribute.name,
                                "valueOrValues": (() => {
                                    const isChecked = event.target.checked;

                                    if (valueOrValues instanceof Array) {
                                        const newValues = [...valueOrValues];

                                        if (isChecked) {
                                            newValues.push(option);
                                        } else {
                                            newValues.splice(newValues.indexOf(option), 1);
                                        }

                                        return newValues;
                                    }

                                    return event.target.checked ? option : "";
                                })()
                            })
                        }
                        onBlur={() =>
                            formValidationDispatch({
                                "action": "focus lost",
                                "name": attribute.name,
                                "fieldIndex": undefined
                            })
                        }
                    />
                    <label
                        htmlFor={`${attribute.name}-${option}`}
                        className={`${classLabel}${attribute.readOnly ? ` ${getClassName("kcInputClassRadioCheckboxLabelDisabled")}` : ""}`}
                    >
                        {advancedMsg(option)}
                    </label>
                </div>
            ))}
        </>
    );
}

function TextareaTag(props: PropsOfInputFiledByType) {
    const { attribute, formValidationDispatch, getClassName, displayableErrors, valueOrValues } = props;

    assert(typeof valueOrValues === "string");

    const value = valueOrValues;

    return (
        <textarea
            id={attribute.name}
            name={attribute.name}
            className={getClassName("kcInputClass")}
            aria-invalid={displayableErrors.length !== 0}
            disabled={attribute.readOnly}
            cols={attribute.annotations.inputTypeCols === undefined ? undefined : parseInt(attribute.annotations.inputTypeCols)}
            rows={attribute.annotations.inputTypeRows === undefined ? undefined : parseInt(attribute.annotations.inputTypeRows)}
            maxLength={attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(attribute.annotations.inputTypeMaxlength)}
            value={value}
            onChange={event =>
                formValidationDispatch({
                    "action": "update",
                    "name": attribute.name,
                    "valueOrValues": event.target.value
                })
            }
            onBlur={() =>
                formValidationDispatch({
                    "action": "focus lost",
                    "name": attribute.name,
                    "fieldIndex": undefined
                })
            }
        />
    );
}

function SelectTag(props: PropsOfInputFiledByType) {
    const { attribute, formValidationDispatch, getClassName, displayableErrors, i18n, valueOrValues } = props;

    const { advancedMsg } = i18n;

    const isMultiple = attribute.annotations.inputType === "multiselect";

    return (
        <select
            id={attribute.name}
            name={attribute.name}
            className={getClassName("kcInputClass")}
            aria-invalid={displayableErrors.length !== 0}
            disabled={attribute.readOnly}
            multiple={isMultiple}
            size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(attribute.annotations.inputTypeSize)}
            value={valueOrValues}
            onChange={event =>
                formValidationDispatch({
                    "action": "update",
                    "name": attribute.name,
                    "valueOrValues": (() => {
                        if (isMultiple) {
                            return Array.from(event.target.selectedOptions).map(option => option.value);
                        }

                        return event.target.value;
                    })()
                })
            }
            onBlur={() =>
                formValidationDispatch({
                    "action": "focus lost",
                    "name": attribute.name,
                    "fieldIndex": undefined
                })
            }
        >
            {!isMultiple && <option value=""></option>}
            {(() => {
                const options = (() => {
                    walk: {
                        const { inputOptionsFromValidation } = attribute.annotations;

                        assert(typeof inputOptionsFromValidation === "string");

                        if (inputOptionsFromValidation === undefined) {
                            break walk;
                        }

                        const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];

                        if (validator === undefined) {
                            break walk;
                        }

                        if (validator.options === undefined) {
                            break walk;
                        }

                        return validator.options;
                    }

                    return attribute.validators.options?.options ?? [];
                })();

                return options.map(option => (
                    <option key={option} value={option}>
                        {(() => {
                            if (attribute.annotations.inputOptionLabels !== undefined) {
                                const { inputOptionLabels } = attribute.annotations;

                                return advancedMsg(inputOptionLabels[option] ?? option);
                            }

                            if (attribute.annotations.inputOptionLabelsI18nPrefix !== undefined) {
                                return advancedMsg(`${attribute.annotations.inputOptionLabelsI18nPrefix}.${option}`);
                            }

                            return option;
                        })()}
                    </option>
                ));
            })()}
        </select>
    );
}
