import { assert, type Equals } from "tsafe/assert";
import type { BuildContext } from "./buildContext";
import { CUSTOM_HANDLER_ENV_NAMES } from "./constants";
import {
    NOT_IMPLEMENTED_EXIT_CODE,
    type CommandName,
    BIN_NAME,
    ApiVersion
} from "./customHandler";
import * as child_process from "child_process";
import { sep as pathSep } from "path";
import * as fs from "fs";

assert<Equals<ApiVersion, "v1">>();

export function maybeDelegateCommandToCustomHandler(params: {
    commandName: CommandName;
    buildContext: BuildContext;
}): { hasBeenHandled: boolean } {
    const { commandName, buildContext } = params;

    const nodeModulesBinDirPath = (() => {
        const binPath = process.argv[1];

        const segments: string[] = [".bin"];

        let foundNodeModules = false;

        for (const segment of binPath.split(pathSep).reverse()) {
            skip_segment: {
                if (foundNodeModules) {
                    break skip_segment;
                }

                if (segment === "node_modules") {
                    foundNodeModules = true;
                    break skip_segment;
                }

                continue;
            }

            segments.unshift(segment);
        }

        return segments.join(pathSep);
    })();

    if (!fs.readdirSync(nodeModulesBinDirPath).includes(BIN_NAME)) {
        console.log(`Custom handler not found`);
        return { hasBeenHandled: false };
    }

    try {
        child_process.execSync(`npx ${BIN_NAME}`, {
            stdio: "inherit",
            env: {
                ...process.env,
                [CUSTOM_HANDLER_ENV_NAMES.COMMAND_NAME]: commandName,
                [CUSTOM_HANDLER_ENV_NAMES.BUILD_CONTEXT]: JSON.stringify(buildContext)
            }
        });
    } catch (error: any) {
        const status = error.status;

        if (status === NOT_IMPLEMENTED_EXIT_CODE) {
            return { hasBeenHandled: false };
        }

        process.exit(status);
    }

    return { hasBeenHandled: true };
}
