import { assert } from "tsafe/assert";
import type { BuildContext } from "./buildContext";
import { CUSTOM_HANDLER_ENV_NAMES } from "./constants";

export const BIN_NAME = "_keycloakify-custom-handler";

export const NOT_IMPLEMENTED_EXIT_CODE = 78;

export type CommandName =
    | "update-kc-gen"
    | "eject-page"
    | "add-story"
    | "initialize-account-theme"
    | "initialize-email-theme"
    | "copy-keycloak-resources-to-public";

export type ApiVersion = "v1";

export function readParams(params: { apiVersion: ApiVersion }) {
    const { apiVersion } = params;

    assert(apiVersion === "v1");

    const commandName = (() => {
        const envValue = process.env[CUSTOM_HANDLER_ENV_NAMES.COMMAND_NAME];

        assert(envValue !== undefined);

        return envValue as CommandName;
    })();

    const buildContext = (() => {
        const envValue = process.env[CUSTOM_HANDLER_ENV_NAMES.BUILD_CONTEXT];

        assert(envValue !== undefined);

        return JSON.parse(envValue) as BuildContext;
    })();

    return { commandName, buildContext };
}
