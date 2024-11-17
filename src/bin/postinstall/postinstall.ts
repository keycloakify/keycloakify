import type { BuildContext } from "../shared/buildContext";
import { getUiModuleMetas, computeHash } from "./uiModuleMeta";
import { installUiModulesPeerDependencies } from "./installUiModulesPeerDependencies";
import {
    readManagedGitignoreFile,
    writeManagedGitignoreFile
} from "./managedGitignoreFile";
import { dirname as pathDirname } from "path";
import { join as pathJoin } from "path";
import { existsAsync } from "../tools/fs.existsAsync";
import * as fsPr from "fs/promises";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const uiModuleMetas = await getUiModuleMetas({ buildContext });

    await installUiModulesPeerDependencies({
        buildContext,
        uiModuleMetas
    });

    const { ejectedFilesRelativePaths } = await readManagedGitignoreFile({
        buildContext
    });

    await writeManagedGitignoreFile({
        buildContext,
        ejectedFilesRelativePaths,
        uiModuleMetas
    });

    await Promise.all(
        uiModuleMetas
            .map(uiModuleMeta =>
                Promise.all(
                    uiModuleMeta.files.map(
                        async ({ fileRelativePath, copyableFilePath, hash }) => {
                            if (ejectedFilesRelativePaths.includes(fileRelativePath)) {
                                return;
                            }

                            const destFilePath = pathJoin(
                                buildContext.themeSrcDirPath,
                                fileRelativePath
                            );

                            skip_condition: {
                                if (!(await existsAsync(destFilePath))) {
                                    break skip_condition;
                                }

                                const destFileHash = computeHash(
                                    await fsPr.readFile(destFilePath)
                                );

                                if (destFileHash !== hash) {
                                    break skip_condition;
                                }

                                return;
                            }

                            {
                                const dirName = pathDirname(destFilePath);

                                if (!(await existsAsync(dirName))) {
                                    await fsPr.mkdir(dirName, { recursive: true });
                                }
                            }

                            await fsPr.copyFile(copyableFilePath, destFilePath);
                        }
                    )
                )
            )
            .flat()
    );
}
