import { downloadAndExtractArchive } from "../../tools/downloadAndExtractArchive";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../../shared/buildContext";
import { transformCodebase } from "../../tools/transformCodebase";
import { join as pathJoin, basename as pathBasename, sep as pathSep } from "path";
import { rm } from "../../tools/fs.rm";
import { extractArchive } from "../../tools/extractArchive";
import * as crypto from "crypto";

export type BuildContextLike = {
    cacheDirPath: string;
    fetchOptions: BuildContext["fetchOptions"];
    extensionJars: BuildContext["extensionJars"];
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function bundleExtensionsIntoJar(params: {
    jarFilePath: string;
    buildContext: BuildContextLike;
}): Promise<void> {
    const { jarFilePath, buildContext } = params;

    if (buildContext.extensionJars.length === 0) {
        return;
    }

    const mergeDirPath = pathJoin(
        buildContext.cacheDirPath,
        `merge_${pathBasename(jarFilePath).replace(/\.jar$/, "")}_${crypto
            .createHash("sha256")
            .update(jarFilePath)
            .digest("hex")
            .substring(0, 5)}`
    );

    await extractArchive({
        archiveFilePath: jarFilePath,
        onArchiveFile: async ({ relativeFilePathInArchive, writeFile }) =>
            writeFile({
                filePath: pathJoin(mergeDirPath, relativeFilePathInArchive)
            })
    });

    for (const extensionJar of buildContext.extensionJars) {
        const transformSourceCode = (params: {
            fileRelativePath: string;
            sourceCode: Buffer;
        }): { modifiedSourceCode: Buffer } | undefined => {
            const { fileRelativePath } = params;

            if (!fileRelativePath.startsWith(`META-INF${pathSep}`)) {
                for (const ext of [".DSA", ".SF", ".RSA"]) {
                    if (fileRelativePath.endsWith(ext)) {
                        return undefined;
                    }
                }
            }

            return undefined;
        };

        switch (extensionJar.type) {
            case "path":
                await extractArchive({
                    archiveFilePath: extensionJar.path,
                    onArchiveFile: async ({
                        relativeFilePathInArchive,
                        writeFile,
                        readFile
                    }) => {
                        const transformResult = transformSourceCode({
                            fileRelativePath: relativeFilePathInArchive,
                            sourceCode: await readFile()
                        });

                        if (transformResult === undefined) {
                            return;
                        }

                        await writeFile({
                            filePath: pathJoin(mergeDirPath, relativeFilePathInArchive),
                            modifiedData: transformResult.modifiedSourceCode
                        });
                    }
                });

                break;

            case "url": {
                const { extractedDirPath } = await downloadAndExtractArchive({
                    url: extensionJar.url,
                    cacheDirPath: buildContext.cacheDirPath,
                    fetchOptions: buildContext.fetchOptions,
                    uniqueIdOfOnArchiveFile: "noOp",
                    onArchiveFile: async ({ fileRelativePath, writeFile }) =>
                        writeFile({ fileRelativePath })
                });
                transformCodebase({
                    srcDirPath: extractedDirPath,
                    destDirPath: mergeDirPath,
                    transformSourceCode
                });
                break;
            }
        }

        /*
        transformCodebase({
            srcDirPath: extractedDirPath,
            destDirPath: mergeDirPath,
            transformSourceCode: ({ fileRelativePath, sourceCode }) => {
                if (fileRelativePath === pathJoin("META-INF", "MANIFEST.MF")) {
                    const sourceCodeStr = sourceCode.toString("utf8");

                    const lines = sourceCodeStr.split(/\r?\n/);

                    console.log(lines);

                    return {
                        modifiedSourceCode: Buffer.concat([
                            sourceCode,
                            Buffer.from(
                                `Class-Path: ${pathBasename(userProvidedJarFilePathOrUrl)}\n`
                            )
                        ])
                    };
                }
            }
        });
        */
    }

    // TODO: Acctually build new jar

    await rm(mergeDirPath, { recursive: true, force: true });
}
