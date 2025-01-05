import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import { getDefaultConfig } from "./defaultConfig";
import { prepareRealmConfig } from "./prepareRealmConfig";
import * as fs from "fs";
import {
    join as pathJoin,
    dirname as pathDirname,
    relative as pathRelative,
    sep as pathSep
} from "path";
import { existsAsync } from "../../tools/fs.existsAsync";
import {
    readRealmJsonFile,
    writeRealmJsonFile,
    type ParsedRealmJson
} from "./ParsedRealmJson";
import {
    dumpContainerConfig,
    type BuildContextLike as BuildContextLike_dumpContainerConfig
} from "./dumpContainerConfig";
import * as runExclusive from "run-exclusive";
import { waitForDebounceFactory } from "powerhooks/tools/waitForDebounce";
import type { ThemeType } from "../../shared/constants";
import chalk from "chalk";

export type BuildContextLike = BuildContextLike_dumpContainerConfig & {
    projectDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>;

export async function getRealmConfig(params: {
    keycloakMajorVersionNumber: number;
    realmJsonFilePath_userProvided: string | undefined;
    parsedKeycloakThemesJsonEntry: { name: string; types: (ThemeType | "email")[] };
    buildContext: BuildContextLike;
}): Promise<{
    realmJsonFilePath: string;
    clientName: string;
    realmName: string;
    username: string;
    onRealmConfigChange: () => Promise<void>;
}> {
    const {
        keycloakMajorVersionNumber,
        realmJsonFilePath_userProvided,
        parsedKeycloakThemesJsonEntry,
        buildContext
    } = params;

    const realmJsonFilePath = pathJoin(
        buildContext.projectDirPath,
        ".keycloakify",
        `realm-kc-${keycloakMajorVersionNumber}.json`
    );

    const parsedRealmJson = await (async () => {
        if (realmJsonFilePath_userProvided !== undefined) {
            return readRealmJsonFile({
                realmJsonFilePath: realmJsonFilePath_userProvided
            });
        }

        if (await existsAsync(realmJsonFilePath)) {
            return readRealmJsonFile({
                realmJsonFilePath
            });
        }

        return getDefaultConfig({ keycloakMajorVersionNumber });
    })();

    const { clientName, realmName, username } = prepareRealmConfig({
        parsedRealmJson,
        keycloakMajorVersionNumber,
        parsedKeycloakThemesJsonEntry
    });

    {
        const dirPath = pathDirname(realmJsonFilePath);

        if (!(await existsAsync(dirPath))) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    await writeRealmJsonFile({
        realmJsonFilePath,
        parsedRealmJson,
        keycloakMajorVersionNumber
    });

    const { onRealmConfigChange } = (() => {
        const run = runExclusive.build(async () => {
            const start = Date.now();

            console.log(
                chalk.grey(`Changes detected to the '${realmName}' config, backing up...`)
            );

            let parsedRealmJson: ParsedRealmJson;

            try {
                parsedRealmJson = await dumpContainerConfig({
                    buildContext,
                    realmName,
                    keycloakMajorVersionNumber
                });
            } catch (error) {
                console.log(chalk.red(`Failed to backup '${realmName}' config:`));

                return;
            }

            await writeRealmJsonFile({
                realmJsonFilePath,
                parsedRealmJson,
                keycloakMajorVersionNumber
            });

            console.log(
                [
                    chalk.grey(
                        `Save changed to \`.${pathSep}${pathRelative(buildContext.projectDirPath, realmJsonFilePath)}\``
                    ),
                    chalk.grey(
                        `Next time you'll be running \`keycloakify start-keycloak\`, the realm '${realmName}' will be restored to this state.`
                    ),
                    chalk.green(
                        `✓ '${realmName}' config backed up completed in ${Date.now() - start}ms`
                    )
                ].join("\n")
            );
        });

        const { waitForDebounce } = waitForDebounceFactory({
            delay: 1_000
        });

        async function onRealmConfigChange() {
            await waitForDebounce();

            run();
        }

        return { onRealmConfigChange };
    })();

    return {
        realmJsonFilePath,
        clientName,
        realmName,
        username,
        onRealmConfigChange
    };
}
