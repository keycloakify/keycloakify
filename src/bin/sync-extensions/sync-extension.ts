import type { BuildContext } from "../shared/buildContext";
import { getExtensionModuleMetas, computeHash } from "./extensionModuleMeta";
import { installExtensionModulesPeerDependencies } from "./installExtensionModulesPeerDependencies";
import {
    readManagedGitignoresFile,
    writeManagedGitignoreFiles
} from "./managedGitignoreFiles";
import { dirname as pathDirname } from "path";
import { join as pathJoin } from "path";
import { existsAsync } from "../tools/fs.existsAsync";
import * as fsPr from "fs/promises";
import { getIsKnownByGit, untrackFromGit } from "../tools/gitUtils";
import { command as updateKcGenCommand } from "../update-kc-gen";
import { getBuildContext } from "../shared/buildContext";
import { KEYCLOAK_THEME } from "../shared/constants";
import { same } from "evt/tools/inDepth/same";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const extensionModuleMetas = await getExtensionModuleMetas({ buildContext });

    await installExtensionModulesPeerDependencies({
        buildContext,
        extensionModuleMetas
    });

    const { ownedFilesRelativePaths } = await readManagedGitignoresFile({
        buildContext
    });

    await writeManagedGitignoreFiles({
        buildContext,
        ownedFilesRelativePaths,
        extensionModuleMetas
    });

    await Promise.all(
        extensionModuleMetas
            .map(extensionModuleMeta =>
                Promise.all(
                    extensionModuleMeta.files.map(
                        async ({
                            isPublic,
                            fileRelativePath,
                            copyableFilePath,
                            hash
                        }) => {
                            if (
                                ownedFilesRelativePaths.some(entry =>
                                    same(entry, { isPublic, fileRelativePath })
                                )
                            ) {
                                return;
                            }

                            const destFilePath = pathJoin(
                                isPublic
                                    ? pathJoin(buildContext.publicDirPath, KEYCLOAK_THEME)
                                    : buildContext.themeSrcDirPath,
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

    await updateKcGenCommand({
        buildContext: getBuildContext({
            projectDirPath: buildContext.projectDirPath
        })
    });
}
