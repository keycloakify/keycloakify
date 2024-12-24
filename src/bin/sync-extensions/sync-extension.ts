import type { BuildContext } from "../shared/buildContext";
import { getExtensionModuleMetas, computeHash } from "./extensionModuleMeta";
import { installExtensionModulesPeerDependencies } from "./installExtensionModulesPeerDependencies";
import {
    readManagedGitignoreFile,
    writeManagedGitignoreFile
} from "./managedGitignoreFile";
import { dirname as pathDirname } from "path";
import { join as pathJoin } from "path";
import { existsAsync } from "../tools/fs.existsAsync";
import * as fsPr from "fs/promises";
import { getIsKnownByGit } from "../tools/isKnownByGit";
import { untrackFromGit } from "../tools/untrackFromGit";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const extensionModuleMetas = await getExtensionModuleMetas({ buildContext });

    await installExtensionModulesPeerDependencies({
        buildContext,
        extensionModuleMetas
    });

    const { ownedFilesRelativePaths } = await readManagedGitignoreFile({
        buildContext
    });

    await writeManagedGitignoreFile({
        buildContext,
        ownedFilesRelativePaths,
        extensionModuleMetas
    });

    await Promise.all(
        extensionModuleMetas
            .map(extensionModuleMeta =>
                Promise.all(
                    extensionModuleMeta.files.map(
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

                            if (await getIsKnownByGit({ filePath: destFilePath })) {
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
