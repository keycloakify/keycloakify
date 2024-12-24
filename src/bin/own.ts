import type { BuildContext } from "./shared/buildContext";
import { getUiModuleFileSourceCodeReadyToBeCopied } from "./postinstall/getUiModuleFileSourceCodeReadyToBeCopied";
import { getAbsoluteAndInOsFormatPath } from "./tools/getAbsoluteAndInOsFormatPath";
import { relative as pathRelative, dirname as pathDirname, join as pathJoin } from "path";
import { getUiModuleMetas } from "./postinstall/uiModuleMeta";
import { getInstalledModuleDirPath } from "./tools/getInstalledModuleDirPath";
import * as fsPr from "fs/promises";
import {
    readManagedGitignoreFile,
    writeManagedGitignoreFile
} from "./postinstall/managedGitignoreFile";
import { isInside } from "./tools/isInside";
import chalk from "chalk";
import type { UiModuleMeta } from "./postinstall/uiModuleMeta";
import { command as command_postinstall } from "./postinstall";

export async function command(params: {
    buildContext: BuildContext;
    cliCommandOptions: {
        path: string;
        isRevert: boolean;
    };
}) {
    const { buildContext, cliCommandOptions } = params;

    const uiModuleMetas = await getUiModuleMetas({ buildContext });

    const { targetFileRelativePathsByUiModuleMeta } = await (async () => {
        const fileOrDirectoryRelativePath = pathRelative(
            buildContext.themeSrcDirPath,
            getAbsoluteAndInOsFormatPath({
                cwd: buildContext.themeSrcDirPath,
                pathIsh: cliCommandOptions.path
            })
        );

        const arr = uiModuleMetas
            .map(uiModuleMeta => ({
                uiModuleMeta,
                fileRelativePaths: uiModuleMeta.files
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

        const targetFileRelativePathsByUiModuleMeta = new Map<UiModuleMeta, string[]>();

        for (const { uiModuleMeta, fileRelativePaths } of arr) {
            targetFileRelativePathsByUiModuleMeta.set(uiModuleMeta, fileRelativePaths);
        }

        return { targetFileRelativePathsByUiModuleMeta };
    })();

    if (targetFileRelativePathsByUiModuleMeta.size === 0) {
        console.log(
            chalk.yellow("There is no UI module files matching the provided path.")
        );
        process.exit(1);
    }

    const { ownedFilesRelativePaths: ownedFilesRelativePaths_current } =
        await readManagedGitignoreFile({
            buildContext
        });

    await (cliCommandOptions.isRevert ? command_revert : command_own)({
        uiModuleMetas,
        targetFileRelativePathsByUiModuleMeta,
        ownedFilesRelativePaths_current,
        buildContext
    });
}

type Params_subcommands = {
    uiModuleMetas: UiModuleMeta[];
    targetFileRelativePathsByUiModuleMeta: Map<UiModuleMeta, string[]>;
    ownedFilesRelativePaths_current: string[];
    buildContext: BuildContext;
};

async function command_own(params: Params_subcommands) {
    const {
        uiModuleMetas,
        targetFileRelativePathsByUiModuleMeta,
        ownedFilesRelativePaths_current,
        buildContext
    } = params;

    await writeManagedGitignoreFile({
        buildContext,
        uiModuleMetas,
        ownedFilesRelativePaths: [
            ...ownedFilesRelativePaths_current,
            ...Array.from(targetFileRelativePathsByUiModuleMeta.values())
                .flat()
                .filter(
                    fileRelativePath =>
                        !ownedFilesRelativePaths_current.includes(fileRelativePath)
                )
        ]
    });

    const writeActions: (() => Promise<void>)[] = [];

    for (const [
        uiModuleMeta,
        fileRelativePaths
    ] of targetFileRelativePathsByUiModuleMeta.entries()) {
        const uiModuleDirPath = await getInstalledModuleDirPath({
            moduleName: uiModuleMeta.moduleName,
            packageJsonDirPath: pathDirname(buildContext.packageJsonFilePath),
            projectDirPath: buildContext.projectDirPath
        });

        for (const fileRelativePath of fileRelativePaths) {
            if (ownedFilesRelativePaths_current.includes(fileRelativePath)) {
                console.log(
                    chalk.grey(`You already have ownership over '${fileRelativePath}'.`)
                );
                continue;
            }

            writeActions.push(async () => {
                const sourceCode = await getUiModuleFileSourceCodeReadyToBeCopied({
                    buildContext,
                    fileRelativePath,
                    isOwnershipAction: true,
                    uiModuleName: uiModuleMeta.moduleName,
                    uiModuleDirPath,
                    uiModuleVersion: uiModuleMeta.version
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
        uiModuleMetas,
        targetFileRelativePathsByUiModuleMeta,
        ownedFilesRelativePaths_current,
        buildContext
    } = params;

    const ownedFilesRelativePaths_toRemove = Array.from(
        targetFileRelativePathsByUiModuleMeta.values()
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
        uiModuleMetas,
        ownedFilesRelativePaths: ownedFilesRelativePaths_current.filter(
            fileRelativePath =>
                !ownedFilesRelativePaths_toRemove.includes(fileRelativePath)
        )
    });

    await command_postinstall({ buildContext });
}
