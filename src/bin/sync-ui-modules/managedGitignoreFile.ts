import * as fsPr from "fs/promises";
import { join as pathJoin, sep as pathSep, dirname as pathDirname } from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import type { UiModuleMeta } from "./uiModuleMeta";
import { existsAsync } from "../tools/fs.existsAsync";

export type BuildContextLike = {
    themeSrcDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

const DELIMITER_START = `# === Ejected files start ===`;
const DELIMITER_END = `# === Ejected files end =====`;

export async function writeManagedGitignoreFile(params: {
    buildContext: BuildContextLike;
    uiModuleMetas: UiModuleMeta[];
    ejectedFilesRelativePaths: string[];
}): Promise<void> {
    const { buildContext, uiModuleMetas, ejectedFilesRelativePaths } = params;

    if (uiModuleMetas.length === 0) {
        return;
    }

    const filePath = pathJoin(buildContext.themeSrcDirPath, ".gitignore");

    const content_new = Buffer.from(
        [
            `# This file is managed by Keycloakify, do not edit it manually.`,
            ``,
            DELIMITER_START,
            ...ejectedFilesRelativePaths.map(fileRelativePath =>
                fileRelativePath.split(pathSep).join("/")
            ),
            DELIMITER_END,
            ``,
            ...uiModuleMetas
                .map(uiModuleMeta => [
                    `# === ${uiModuleMeta.moduleName} v${uiModuleMeta.version} ===`,
                    ...uiModuleMeta.files
                        .map(({ fileRelativePath }) => fileRelativePath)
                        .filter(
                            fileRelativePath =>
                                !ejectedFilesRelativePaths.includes(fileRelativePath)
                        )
                        .map(
                            fileRelativePath =>
                                `/${fileRelativePath.split(pathSep).join("/").replace(/^\.\//, "")}`
                        ),

                    ``
                ])
                .flat()
        ].join("\n"),
        "utf8"
    );

    const content_current = await (async () => {
        if (!(await existsAsync(filePath))) {
            return undefined;
        }

        return await fsPr.readFile(filePath);
    })();

    if (content_current !== undefined && content_current.equals(content_new)) {
        return;
    }

    create_dir: {
        const dirPath = pathDirname(filePath);

        if (await existsAsync(dirPath)) {
            break create_dir;
        }

        await fsPr.mkdir(dirPath, { recursive: true });
    }

    await fsPr.writeFile(filePath, content_new);
}
