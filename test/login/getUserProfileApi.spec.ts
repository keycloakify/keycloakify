import type { Attribute } from "keycloakify/login/KcContext";
import { createGetKcContextMock } from "keycloakify/login/KcContext";
import { getUserProfileApi } from "keycloakify/login/lib/getUserProfileApi/getUserProfileApi";
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
    Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
            body: {},
            querySelectorAll: () => []
        }
    });

    Object.defineProperty(globalThis, "MutationObserver", {
        configurable: true,
        value: class {
            observe() {}
            disconnect() {}
        }
    });
});

describe("getUserProfileApi", () => {
    it("clears a stale server error when a multiselect checkbox value changes", () => {
        const { getKcContextMock } = createGetKcContextMock({
            kcContextExtension: {},
            kcContextExtensionPerPage: {}
        });

        const kcContext = getKcContextMock({ pageId: "register.ftl" });

        kcContext.profile.attributesByName = {
            acceptTerms: createAttribute({
                name: "acceptTerms",
                inputType: "multiselect-checkboxes"
            })
        };

        kcContext.messagesPerField.existsError = fieldName => fieldName === "acceptTerms";
        kcContext.messagesPerField.get = fieldName =>
            fieldName === "acceptTerms" ? "This field is required." : "";

        const userProfileApi = getUserProfileApi({
            kcContext,
            doMakeUserConfirmPassword: false
        });

        const initialFieldState = getFieldState({
            userProfileApi,
            attributeName: "acceptTerms"
        });

        expect(initialFieldState.valueOrValues).toEqual([]);
        expect(
            initialFieldState.displayableErrors.some(
                ({ source }) => source.type === "server"
            )
        ).toBe(true);

        userProfileApi.dispatchFormAction({
            action: "update",
            name: "acceptTerms",
            valueOrValues: ["true"]
        });

        const updatedFieldState = getFieldState({
            userProfileApi,
            attributeName: "acceptTerms"
        });

        expect(updatedFieldState.valueOrValues).toEqual(["true"]);
        expect(
            updatedFieldState.displayableErrors.some(
                ({ source }) => source.type === "server"
            )
        ).toBe(false);
        expect(userProfileApi.getFormState().isFormSubmittable).toBe(true);

        userProfileApi.dispatchFormAction({
            action: "update",
            name: "acceptTerms",
            valueOrValues: []
        });

        const revertedFieldState = getFieldState({
            userProfileApi,
            attributeName: "acceptTerms"
        });

        expect(
            revertedFieldState.displayableErrors.some(
                ({ source }) => source.type === "server"
            )
        ).toBe(true);
        expect(userProfileApi.getFormState().isFormSubmittable).toBe(false);
    });

    it("keeps the existing placeholder behavior for repeated multivalued fields", () => {
        const { getKcContextMock } = createGetKcContextMock({
            kcContextExtension: {},
            kcContextExtensionPerPage: {}
        });

        const kcContext = getKcContextMock({ pageId: "register.ftl" });

        kcContext.profile.attributesByName = {
            aliases: createAttribute({ name: "aliases" })
        };

        kcContext.messagesPerField.existsError = fieldName => fieldName === "aliases";
        kcContext.messagesPerField.get = fieldName =>
            fieldName === "aliases" ? "Server-side validation error." : "";

        const userProfileApi = getUserProfileApi({
            kcContext,
            doMakeUserConfirmPassword: false
        });

        expect(
            getFieldState({ userProfileApi, attributeName: "aliases" }).valueOrValues
        ).toEqual([""]);

        userProfileApi.dispatchFormAction({
            action: "update",
            name: "aliases",
            valueOrValues: ["", "another-value"]
        });

        expect(
            getFieldState({
                userProfileApi,
                attributeName: "aliases"
            }).displayableErrors.some(({ source }) => source.type === "server")
        ).toBe(true);
    });
});

function createAttribute(params: { name: string; inputType?: string }): Attribute {
    const { name, inputType } = params;

    return {
        name,
        displayName: name,
        required: true,
        readOnly: false,
        multivalued: true,
        validators: {
            options: {
                options: ["true"]
            }
        },
        annotations: {
            inputType
        }
    };
}

function getFieldState(params: {
    userProfileApi: ReturnType<typeof getUserProfileApi>;
    attributeName: string;
}) {
    const { userProfileApi, attributeName } = params;

    const fieldState = userProfileApi
        .getFormState()
        .formFieldStates.find(({ attribute }) => attribute.name === attributeName);

    expect(fieldState).toBeDefined();

    return fieldState!;
}
