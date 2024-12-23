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

    const fileRelativePaths = uiModuleMetas
        .map(({ files }) =>
            files
                .map(({ fileRelativePath }) => fileRelativePath)
                .filter(
                    fileRelativePath =>
                        fileRelativePath === fileOrDirectoryRelativePath ||
                        isInside({
                            dirPath: fileOrDirectoryRelativePath,
                            filePath: fileRelativePath
                        })
                )
        )
        .flat();

    if (fileRelativePaths.length === 0) {
        console.log(
            chalk.yellow("There is no UI module files matching the provided path.")
        );
        process.exit(1);
    }

    for (const fileRelativePath of fileRelativePaths) {
        const uiModuleMeta = uiModuleMetas.find(({ files }) =>
            files
                .map(({ fileRelativePath }) => fileRelativePath)
                .includes(fileRelativePath)
        );

        if (!uiModuleMeta) {
            throw new Error(`No UI module found for the file ${fileRelativePath}`);
        }

        const uiModuleDirPath = await getInstalledModuleDirPath({
            moduleName: uiModuleMeta.moduleName,
            packageJsonDirPath: pathDirname(buildContext.packageJsonFilePath),
            projectDirPath: buildContext.projectDirPath
        });

        const sourceCode = await getUiModuleFileSourceCodeReadyToBeCopied({
            buildContext,
            fileRelativePath,
            isForEjection: true,
            uiModuleName: uiModuleMeta.moduleName,
            uiModuleDirPath,
            uiModuleVersion: uiModuleMeta.version
        });

        await fsPr.writeFile(
            pathJoin(buildContext.themeSrcDirPath, fileRelativePath),
            sourceCode
        );

        const { ejectedFilesRelativePaths } = await readManagedGitignoreFile({
            buildContext
        });

        await writeManagedGitignoreFile({
            buildContext,
            uiModuleMetas,
            ejectedFilesRelativePaths: [...ejectedFilesRelativePaths, fileRelativePath]
        });
    }
}
