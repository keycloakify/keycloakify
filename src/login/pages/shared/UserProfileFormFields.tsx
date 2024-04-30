import { useEffect, Fragment } from "react";
import type { ClassKey } from "keycloakify/login/TemplateProps";
import { clsx } from "keycloakify/tools/clsx";
import {
    useUserProfileForm,
    type KcContextLike,
    type FormAction,
    type FormFieldError,
    FormFieldState
} from "keycloakify/login/lib/useUserProfileForm";
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
    index: number;
    value: string;
    dispatchFormAction: React.Dispatch<FormAction>;
    formFieldErrors: FormFieldError[];
    i18n: I18n;
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
            {formFieldStates.map(({ index, value, attribute, displayableErrors }) => {
                const formGroupClassName = clsx(
                    getClassName("kcFormGroupClass"),
                    displayableErrors.length !== 0 && getClassName("kcFormGroupErrorClass")
                );

                return (
                    <Fragment key={`${attribute.name}-${index}`}>
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
                                index={index}
                                value={value}
                                dispatchFormAction={dispatchFormAction}
                                formFieldErrors={displayableErrors}
                                i18n={i18n}
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
                                {attribute.annotations.inputHelperTextBefore !== undefined && index === 0 && (
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
                                    index={index}
                                    value={value}
                                    formValidationDispatch={dispatchFormAction}
                                    getClassName={getClassName}
                                    i18n={i18n}
                                />
                                {attribute.multivalued && (
                                    <AddRemoveButtonsMultiValuedAttribute
                                        formFieldStates={formFieldStates}
                                        attribute={attribute}
                                        index={index}
                                        dispatchFormAction={dispatchFormAction}
                                        i18n={i18n}
                                    />
                                )}
                                {displayableErrors.length !== 0 && (
                                    <FieldErrors
                                        attribute={attribute}
                                        index={index}
                                        getClassName={getClassName}
                                        displayableErrors={displayableErrors}
                                    />
                                )}
                                {attribute.annotations.inputHelperTextAfter !== undefined && index === 0 && (
                                    <div
                                        className={getClassName("kcInputHelperTextAfterClass")}
                                        id={`form-help-text-before-${attribute.name}`}
                                        aria-live="polite"
                                    >
                                        {advancedMsg(attribute.annotations.inputHelperTextAfter)}
                                    </div>
                                )}

                                {AfterField !== undefined && (
                                    <AfterField
                                        attribute={attribute}
                                        index={index}
                                        value={value}
                                        dispatchFormAction={dispatchFormAction}
                                        formFieldErrors={displayableErrors}
                                        i18n={i18n}
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
    index: number;
    getClassName: UserProfileFormFieldsProps["getClassName"];
    displayableErrors: FormFieldError[];
}) {
    const { attribute, index, getClassName, displayableErrors } = props;

    return (
        <span
            id={`input-error-${attribute.name}${index === 0 ? "" : `-${index + 1}`}`}
            className={getClassName("kcInputErrorMessageClass")}
            style={{
                "position": displayableErrors.length === 1 ? "absolute" : undefined
            }}
            aria-live="polite"
        >
            {displayableErrors.map(({ errorMessage }, i, arr) => (
                <>
                    <span key={i}>{errorMessage}</span>
                    {arr.length - 1 !== i && <br />}
                </>
            ))}
        </span>
    );
}

function AddRemoveButtonsMultiValuedAttribute(props: {
    formFieldStates: FormFieldState[];
    attribute: Attribute;
    index: number;
    dispatchFormAction: React.Dispatch<
        Extract<FormAction, { action: "add value to multi-valued attribute" | "remove value from multi-valued attribute" }>
    >;
    i18n: I18n;
}) {
    const { formFieldStates, attribute, index, dispatchFormAction, i18n } = props;

    const { msg } = i18n;

    const currentCount = formFieldStates.filter(({ attribute: attribute_i }) => attribute_i.name === attribute.name).length;

    const hasRemove = (() => {
        if (currentCount === 1) {
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

        if (currentCount === minCount) {
            return false;
        }

        return true;
    })();

    const hasAdd = (() => {
        if (index + 1 !== currentCount) {
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

        if (currentCount === maxCount) {
            return false;
        }

        return true;
    })();

    return (
        <>
            {hasRemove && (
                <button
                    id={`kc-remove-${attribute.name}-${index + 1}`}
                    type="button"
                    className="pf-c-button pf-m-inline pf-m-link"
                    onClick={() =>
                        dispatchFormAction({
                            "action": "remove value from multi-valued attribute",
                            "name": attribute.name,
                            index
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
                            "action": "add value to multi-valued attribute",
                            "name": attribute.name
                        })
                    }
                >
                    {msg("addValue")}
                </button>
            )}
        </>
    );
}

type PropsOfInputFiledByType = {
    attribute: Attribute;
    index: number;
    value: string;
    displayableErrors: FormFieldError[];
    formValidationDispatch: React.Dispatch<FormAction>;
    getClassName: UserProfileFormFieldsProps["getClassName"];
    i18n: I18n;
};

function InputFiledByType(props: PropsOfInputFiledByType) {
    const { attribute } = props;

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
            return <InputTag {...props} />;
    }
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

    const { attribute, formValidationDispatch, getClassName, index } = props;

    const { advancedMsg } = props.i18n;

    const { classDiv, classInput, classLabel, inputType } =
        attribute.annotations.inputType === "select-radiobuttons"
            ? {
                  "inputType": "radio",
                  "classDiv": getClassName("kcInputClassRadio"),
                  "classInput": getClassName("kcInputClassRadioInput"),
                  "classLabel": getClassName("kcInputClassRadioLabel")
              }
            : {
                  "inputType": "checkbox",
                  "classDiv": getClassName("kcInputClassCheckbox"),
                  "classInput": getClassName("kcInputClassCheckboxInput"),
                  "classLabel": getClassName("kcInputClassCheckboxLabel")
              };

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

    return (
        <>
            {options.map(option => (
                <div key={option} className={classDiv}>
                    <input
                        type={inputType}
                        id={`${attribute.name}-${option}-${index === 0 ? "" : index + 1}`}
                        name={attribute.name}
                        value={option}
                        className={classInput}
                        aria-invalid={props.displayableErrors.length !== 0}
                        disabled={attribute.readOnly}
                        checked={props.value === option}
                        onChange={() =>
                            formValidationDispatch({
                                "action": "update value",
                                "name": attribute.name,
                                "index": props.index,
                                "newValue": option
                            })
                        }
                        onBlur={() =>
                            formValidationDispatch({
                                "action": "focus lost",
                                "name": attribute.name,
                                "index": props.index
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
    const { attribute, index, value, formValidationDispatch, getClassName, displayableErrors } = props;

    return (
        <textarea
            id={`${attribute.name}-${index === 0 ? "" : index + 1}`}
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
                    "action": "update value",
                    "name": attribute.name,
                    index,
                    "newValue": event.target.value
                })
            }
            onBlur={() =>
                formValidationDispatch({
                    "action": "focus lost",
                    "name": attribute.name,
                    index
                })
            }
        />
    );
}

function SelectTag(props: PropsOfInputFiledByType) {
    const { attribute, index, value, formValidationDispatch, getClassName, displayableErrors, i18n } = props;

    const { advancedMsg } = i18n;

    const isMultiple = attribute.annotations.inputType === "multiselect";

    return (
        <select
            id={`${attribute.name}-${index === 0 ? "" : index + 1}`}
            name={attribute.name}
            className={getClassName("kcInputClass")}
            aria-invalid={displayableErrors.length !== 0}
            disabled={attribute.readOnly}
            multiple={isMultiple}
            size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(attribute.annotations.inputTypeSize)}
            value={value}
            onChange={event =>
                formValidationDispatch({
                    "action": "update value",
                    "name": attribute.name,
                    index,
                    "newValue": event.target.value
                })
            }
            onBlur={() =>
                formValidationDispatch({
                    "action": "focus lost",
                    "name": attribute.name,
                    index
                })
            }
        >
            {attribute.annotations.inputType === "select" && <option value=""></option>}
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
                    <option key={option} value={option} selected={value === option}>
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
