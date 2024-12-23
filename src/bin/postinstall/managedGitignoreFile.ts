import * as fsPr from "fs/promises";
import {
    join as pathJoin,
    sep as pathSep,
    dirname as pathDirname,
    relative as pathRelative
} from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import type { UiModuleMeta } from "./uiModuleMeta";
import { existsAsync } from "../tools/fs.existsAsync";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";

export type BuildContextLike = {
    themeSrcDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

const DELIMITER_START = `# === Owned files start ===`;
const DELIMITER_END = `# === Owned files end =====`;

export async function writeManagedGitignoreFile(params: {
    buildContext: BuildContextLike;
    uiModuleMetas: UiModuleMeta[];
    ownedFilesRelativePaths: string[];
}): Promise<void> {
    const { buildContext, uiModuleMetas, ownedFilesRelativePaths } = params;

    if (uiModuleMetas.length === 0) {
        return;
    }

    const filePath = pathJoin(buildContext.themeSrcDirPath, ".gitignore");

    const content_new = Buffer.from(
        [
            `# This file is managed by Keycloakify, do not edit it manually.`,
            ``,
            DELIMITER_START,
            ...ownedFilesRelativePaths
                .map(fileRelativePath => fileRelativePath.split(pathSep).join("/"))
                .map(line => `# ${line}`),
            DELIMITER_END,
            ``,
            ...uiModuleMetas
                .map(uiModuleMeta => [
                    `# === ${uiModuleMeta.moduleName} v${uiModuleMeta.version} ===`,
                    ...uiModuleMeta.files
                        .map(({ fileRelativePath }) => fileRelativePath)
                        .filter(
                            fileRelativePath =>
                                !ownedFilesRelativePaths.includes(fileRelativePath)
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

export async function readManagedGitignoreFile(params: {
    buildContext: BuildContextLike;
}): Promise<{
    ownedFilesRelativePaths: string[];
}> {
    const { buildContext } = params;

    const filePath = pathJoin(buildContext.themeSrcDirPath, ".gitignore");

    if (!(await existsAsync(filePath))) {
        return { ownedFilesRelativePaths: [] };
    }

    const contentStr = (await fsPr.readFile(filePath)).toString("utf8");

    const payload = (() => {
        const index_start = contentStr.indexOf(DELIMITER_START);
        const index_end = contentStr.indexOf(DELIMITER_END);

        if (index_start === -1 || index_end === -1) {
            return undefined;
        }

        return contentStr.slice(index_start + DELIMITER_START.length, index_end).trim();
    })();

    if (payload === undefined) {
        return { ownedFilesRelativePaths: [] };
    }

    const ownedFilesRelativePaths = payload
        .split("\n")
        .map(line => line.trim())
        .map(line => line.replace(/^# /, ""))
        .filter(line => line !== "")
        .map(line =>
            getAbsoluteAndInOsFormatPath({
                cwd: buildContext.themeSrcDirPath,
                pathIsh: line
            })
        )
        .map(filePath => pathRelative(buildContext.themeSrcDirPath, filePath));

    return { ownedFilesRelativePaths };
}
