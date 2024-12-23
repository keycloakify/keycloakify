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
import { getIsTrackedByGit } from "../tools/isTrackedByGit";
import { untrackFromGit } from "../tools/untrackFromGit";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const uiModuleMetas = await getUiModuleMetas({ buildContext });

    await installUiModulesPeerDependencies({
        buildContext,
        uiModuleMetas
    });

    const { ownedFilesRelativePaths } = await readManagedGitignoreFile({
        buildContext
    });

    await writeManagedGitignoreFile({
        buildContext,
        ownedFilesRelativePaths,
        uiModuleMetas
    });

    await Promise.all(
        uiModuleMetas
            .map(uiModuleMeta =>
                Promise.all(
                    uiModuleMeta.files.map(
                        async ({ fileRelativePath, copyableFilePath, hash }) => {
                            if (ownedFilesRelativePaths.includes(fileRelativePath)) {
                                return;
                            }

                            const destFilePath = pathJoin(
                                buildContext.themeSrcDirPath,
                                fileRelativePath
                            );

                            const doesFileExist = await existsAsync(destFilePath);

                            skip_condition: {
                                if (!doesFileExist) {
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

                            git_untrack: {
                                if (!doesFileExist) {
                                    break git_untrack;
                                }

                                const isTracked = await getIsTrackedByGit({
                                    filePath: destFilePath
                                });

                                if (!isTracked) {
                                    break git_untrack;
                                }

                                await untrackFromGit({
                                    filePath: destFilePath
                                });
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
