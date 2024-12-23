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

export async function command(params: {
    buildContext: BuildContext;
    cliCommandOptions: {
        path: string;
    };
}) {
    const { buildContext, cliCommandOptions } = params;

    const fileOrDirectoryRelativePath = pathRelative(
        buildContext.themeSrcDirPath,
        getAbsoluteAndInOsFormatPath({
            cwd: buildContext.themeSrcDirPath,
            pathIsh: cliCommandOptions.path
        })
    );

    const uiModuleMetas = await getUiModuleMetas({ buildContext });

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

    if (arr.length === 0) {
        console.log(
            chalk.yellow("There is no UI module files matching the provided path.")
        );
        process.exit(1);
    }

    const { ownedFilesRelativePaths: ownedFilesRelativePaths_before } =
        await readManagedGitignoreFile({
            buildContext
        });

    const ownedFilesRelativePaths_toAdd: string[] = [];

    for (const { uiModuleMeta, fileRelativePaths } of arr) {
        const uiModuleDirPath = await getInstalledModuleDirPath({
            moduleName: uiModuleMeta.moduleName,
            packageJsonDirPath: pathDirname(buildContext.packageJsonFilePath),
            projectDirPath: buildContext.projectDirPath
        });

        for (const fileRelativePath of fileRelativePaths) {
            if (ownedFilesRelativePaths_before.includes(fileRelativePath)) {
                console.log(
                    chalk.yellow(`You already have ownership over "${fileRelativePath}".`)
                );
                continue;
            }

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

            ownedFilesRelativePaths_toAdd.push(fileRelativePath);
        }
    }

    if (ownedFilesRelativePaths_toAdd.length === 0) {
        console.log(chalk.yellow("No new file claimed."));
        process.exit(1);
    }

    await writeManagedGitignoreFile({
        buildContext,
        uiModuleMetas,
        ownedFilesRelativePaths: [
            ...ownedFilesRelativePaths_before,
            ...ownedFilesRelativePaths_toAdd
        ]
    });
}
