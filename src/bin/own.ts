import type { BuildContext } from "./shared/buildContext";
import { getExtensionModuleFileSourceCodeReadyToBeCopied } from "./sync-extensions/getExtensionModuleFileSourceCodeReadyToBeCopied";
import type { ExtensionModuleMeta } from "./sync-extensions/extensionModuleMeta";
import { command as command_syncExtensions } from "./sync-extensions/sync-extension";
import {
    readManagedGitignoreFile,
    writeManagedGitignoreFile
} from "./sync-extensions/managedGitignoreFile";
import { getExtensionModuleMetas } from "./sync-extensions/extensionModuleMeta";
import { getAbsoluteAndInOsFormatPath } from "./tools/getAbsoluteAndInOsFormatPath";
import { relative as pathRelative, dirname as pathDirname, join as pathJoin } from "path";
import { getInstalledModuleDirPath } from "./tools/getInstalledModuleDirPath";
import * as fsPr from "fs/promises";
import { isInside } from "./tools/isInside";
import chalk from "chalk";

export async function command(params: {
    buildContext: BuildContext;
    cliCommandOptions: {
        path: string;
        isRevert: boolean;
    };
}) {
    const { buildContext, cliCommandOptions } = params;

    const extensionModuleMetas = await getExtensionModuleMetas({ buildContext });

    const { targetFileRelativePathsByExtensionModuleMeta } = await (async () => {
        const fileOrDirectoryRelativePath = pathRelative(
            buildContext.themeSrcDirPath,
            getAbsoluteAndInOsFormatPath({
                cwd: buildContext.themeSrcDirPath,
                pathIsh: cliCommandOptions.path
            })
        );

        const arr = extensionModuleMetas
            .map(extensionModuleMeta => ({
                extensionModuleMeta,
                fileRelativePaths: extensionModuleMeta.files
                    .map(({ fileRelativePath }) => fileRelativePath)
                    .filter(
                        fileRelativePath =>
                            fileRelativePath === fileOrDirectoryRelativePath ||
                            isInside({
                                dirPath: fileOrDirectoryRelativePath,
                                filePath: fileRelativePath
                            })
                    )
            }))
            .filter(({ fileRelativePaths }) => fileRelativePaths.length !== 0);

        const targetFileRelativePathsByExtensionModuleMeta = new Map<
            ExtensionModuleMeta,
            string[]
        >();

        for (const { extensionModuleMeta, fileRelativePaths } of arr) {
            targetFileRelativePathsByExtensionModuleMeta.set(
                extensionModuleMeta,
                fileRelativePaths
            );
        }

        return { targetFileRelativePathsByExtensionModuleMeta };
    })();

    if (targetFileRelativePathsByExtensionModuleMeta.size === 0) {
        console.log(
            chalk.yellow(
                "There is no Keycloakify extension modules files matching the provided path."
            )
        );
        process.exit(1);
    }

    const { ownedFilesRelativePaths: ownedFilesRelativePaths_current } =
        await readManagedGitignoreFile({
            buildContext
        });

    await (cliCommandOptions.isRevert ? command_revert : command_own)({
        extensionModuleMetas,
        targetFileRelativePathsByExtensionModuleMeta,
        ownedFilesRelativePaths_current,
        buildContext
    });
}

type Params_subcommands = {
    extensionModuleMetas: ExtensionModuleMeta[];
    targetFileRelativePathsByExtensionModuleMeta: Map<ExtensionModuleMeta, string[]>;
    ownedFilesRelativePaths_current: string[];
    buildContext: BuildContext;
};

async function command_own(params: Params_subcommands) {
    const {
        extensionModuleMetas,
        targetFileRelativePathsByExtensionModuleMeta,
        ownedFilesRelativePaths_current,
        buildContext
    } = params;

    await writeManagedGitignoreFile({
        buildContext,
        extensionModuleMetas,
        ownedFilesRelativePaths: [
            ...ownedFilesRelativePaths_current,
            ...Array.from(targetFileRelativePathsByExtensionModuleMeta.values())
                .flat()
                .filter(
                    fileRelativePath =>
                        !ownedFilesRelativePaths_current.includes(fileRelativePath)
                )
        ]
    });

    const writeActions: (() => Promise<void>)[] = [];

    for (const [
        extensionModuleMeta,
        fileRelativePaths
    ] of targetFileRelativePathsByExtensionModuleMeta.entries()) {
        const extensionModuleDirPath = await getInstalledModuleDirPath({
            moduleName: extensionModuleMeta.moduleName,
            packageJsonDirPath: pathDirname(buildContext.packageJsonFilePath)
        });

        for (const fileRelativePath of fileRelativePaths) {
            if (ownedFilesRelativePaths_current.includes(fileRelativePath)) {
                console.log(
                    chalk.grey(`You already have ownership over '${fileRelativePath}'.`)
                );
                continue;
            }

            writeActions.push(async () => {
                const sourceCode = await getExtensionModuleFileSourceCodeReadyToBeCopied({
                    buildContext,
                    fileRelativePath,
                    isOwnershipAction: true,
                    extensionModuleName: extensionModuleMeta.moduleName,
                    extensionModuleDirPath,
                    extensionModuleVersion: extensionModuleMeta.version
                });

                await fsPr.writeFile(
                    pathJoin(buildContext.themeSrcDirPath, fileRelativePath),
                    sourceCode
                );

                console.log(chalk.green(`Ownership over '${fileRelativePath}' claimed.`));
            });
        }
    }

    if (writeActions.length === 0) {
        console.log(chalk.yellow("No new file claimed."));
        return;
    }

    await Promise.all(writeActions.map(action => action()));
}

async function command_revert(params: Params_subcommands) {
    const {
        extensionModuleMetas,
        targetFileRelativePathsByExtensionModuleMeta,
        ownedFilesRelativePaths_current,
        buildContext
    } = params;

    const ownedFilesRelativePaths_toRemove = Array.from(
        targetFileRelativePathsByExtensionModuleMeta.values()
    )
        .flat()
        .filter(fileRelativePath => {
            if (!ownedFilesRelativePaths_current.includes(fileRelativePath)) {
                console.log(
                    chalk.grey(`Ownership over '${fileRelativePath}' wasn't claimed.`)
                );
                return false;
            }

            console.log(
                chalk.green(`Ownership over '${fileRelativePath}' relinquished.`)
            );

            return true;
        });

    if (ownedFilesRelativePaths_toRemove.length === 0) {
        console.log(chalk.yellow("No file relinquished."));
        return;
    }

    await writeManagedGitignoreFile({
        buildContext,
        extensionModuleMetas,
        ownedFilesRelativePaths: ownedFilesRelativePaths_current.filter(
            fileRelativePath =>
                !ownedFilesRelativePaths_toRemove.includes(fileRelativePath)
        )
    });

    await command_syncExtensions({ buildContext });
}
