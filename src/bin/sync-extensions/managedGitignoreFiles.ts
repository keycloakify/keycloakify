import * as fsPr from "fs/promises";
import {
    join as pathJoin,
    sep as pathSep,
    dirname as pathDirname,
    relative as pathRelative
} from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import type { ExtensionModuleMeta } from "./extensionModuleMeta";
import { existsAsync } from "../tools/fs.existsAsync";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";
import { KEYCLOAK_THEME } from "../shared/constants";

export type BuildContextLike = {
    themeSrcDirPath: string;
    publicDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

type ExtensionModuleMetaLike = {
    moduleName: string;
    version: string;
    files: {
        isPublic: boolean;
        fileRelativePath: string;
    }[];
};

assert<ExtensionModuleMeta extends ExtensionModuleMetaLike ? true : false>();

const DELIMITER_START = `# === Owned files start ===`;
const DELIMITER_END = `# === Owned files end =====`;

export async function writeManagedGitignoreFiles(params: {
    buildContext: BuildContextLike;
    extensionModuleMetas: ExtensionModuleMetaLike[];
    ownedFilesRelativePaths: { isPublic: boolean; fileRelativePath: string }[];
}): Promise<void> {
    const { buildContext } = params;

    for (const isPublicIteration of [false, true] as const) {
        const extensionModuleMetas_ctx = params.extensionModuleMetas
            .map(extensionModuleMeta => ({
                ...extensionModuleMeta,
                files: extensionModuleMeta.files.filter(
                    ({ isPublic }) => isPublic === isPublicIteration
                )
            }))
            .filter(extensionModuleMeta => extensionModuleMeta.files.length !== 0);

        if (extensionModuleMetas_ctx.length === 0) {
            continue;
        }

        const ownedFilesRelativePaths_ctx = params.ownedFilesRelativePaths.filter(
            ({ isPublic }) => isPublic === isPublicIteration
        );

        const filePath = pathJoin(
            isPublicIteration
                ? pathJoin(buildContext.publicDirPath, KEYCLOAK_THEME)
                : buildContext.themeSrcDirPath,
            ".gitignore"
        );

        const content_new = Buffer.from(
            [
                `# This file is managed by Keycloakify, do not edit it manually.`,
                ``,
                DELIMITER_START,
                ...ownedFilesRelativePaths_ctx
                    .map(({ fileRelativePath }) => fileRelativePath)
                    .map(fileRelativePath => fileRelativePath.split(pathSep).join("/"))
                    .sort(posixPathCompareFn)
                    .map(line => `# ${line}`),
                DELIMITER_END,
                ``,
                ...[...extensionModuleMetas_ctx]
                    .sort((a, b) => {
                        const n = a.moduleName.length - b.moduleName.length;

                        return n !== 0 ? n : a.moduleName.localeCompare(b.moduleName);
                    })
                    .map(extensionModuleMeta => [
                        `# === ${extensionModuleMeta.moduleName} v${extensionModuleMeta.version} ===`,
                        ...extensionModuleMeta.files
                            .map(({ fileRelativePath }) => fileRelativePath)
                            .filter(
                                fileRelativePath =>
                                    !ownedFilesRelativePaths_ctx
                                        .map(({ fileRelativePath }) => fileRelativePath)
                                        .includes(fileRelativePath)
                            )
                            .map(
                                fileRelativePath =>
                                    `/${fileRelativePath.split(pathSep).join("/").replace(/^\.\//, "")}`
                            )
                            .sort(posixPathCompareFn),

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
            continue;
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
}

export async function readManagedGitignoresFile(params: {
    buildContext: BuildContextLike;
}): Promise<{
    ownedFilesRelativePaths: { isPublic: boolean; fileRelativePath: string }[];
}> {
    const { buildContext } = params;

    const ownedFilesRelativePaths: { isPublic: boolean; fileRelativePath: string }[] = [];

    for (const isPublicIteration of [false, true] as const) {
        const filePath = pathJoin(
            isPublicIteration
                ? pathJoin(buildContext.publicDirPath, KEYCLOAK_THEME)
                : buildContext.themeSrcDirPath,
            ".gitignore"
        );

        if (!(await existsAsync(filePath))) {
            continue;
        }

        const contentStr = (await fsPr.readFile(filePath)).toString("utf8");

        const payload = (() => {
            const index_start = contentStr.indexOf(DELIMITER_START);
            const index_end = contentStr.indexOf(DELIMITER_END);

            if (index_start === -1 || index_end === -1) {
                return undefined;
            }

            return contentStr
                .slice(index_start + DELIMITER_START.length, index_end)
                .trim();
        })();

        if (payload === undefined) {
            continue;
        }

        payload
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
            .map(filePath => pathRelative(buildContext.themeSrcDirPath, filePath))
            .forEach(fileRelativePath =>
                ownedFilesRelativePaths.push({
                    isPublic: isPublicIteration,
                    fileRelativePath
                })
            );
    }

    return { ownedFilesRelativePaths };
}

function posixPathCompareFn(a: string, b: string) {
    const aParts = a.split("/");
    const bParts = b.split("/");

    const diff = aParts.length - bParts.length;

    if (diff !== 0) {
        return diff;
    }

    const len = Math.min(aParts.length, bParts.length);

    for (let i = 0; i < len; i++) {
        const cmp = aParts[i].localeCompare(bParts[i], undefined, {
            numeric: true,
            sensitivity: "base"
        });
        if (cmp !== 0) return cmp;
    }

    return 0;
}
