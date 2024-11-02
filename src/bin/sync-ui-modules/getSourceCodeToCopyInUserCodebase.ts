import { getIsPrettierAvailable, runPrettier } from "../tools/runPrettier";
import * as fsPr from "fs/promises";
import { join as pathJoin, sep as pathSep } from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";

export type BuildContextLike = {
    themeSrcDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function getSourceCodeToCopyInUserCodebase(params: {
    buildContext: BuildContextLike;
    relativeFromDirPath: string;
    fileRelativePath: string;
    commentData: {
        isForEjection: boolean;
        uiModuleName: string;
        uiModuleVersion: string;
    };
}): Promise<string> {
    const { buildContext, relativeFromDirPath, fileRelativePath, commentData } = params;

    let sourceCode = (
        await fsPr.readFile(pathJoin(relativeFromDirPath, fileRelativePath))
    ).toString("utf8");

    const comment = (() => {
        if (commentData.isForEjection) {
            return [
                `/*`,
                `    This file was ejected from ${commentData.uiModuleName} version ${commentData.uiModuleVersion}.`,
                `*/`
            ].join("\n");
        } else {
            return [
                `/*`,
                `    WARNING: Before modifying this file run the following command:`,
                `    \`npx keycloakify eject-file ${fileRelativePath.split(pathSep).join("/")}\``,
                `    `,
                `    This file comes from ${commentData.uiModuleName} version ${commentData.uiModuleVersion}.`,
                `*/`
            ];
        }
    })();

    sourceCode = [comment, ``, sourceCode].join("\n");

    format: {
        if (!(await getIsPrettierAvailable())) {
            break format;
        }

        sourceCode = await runPrettier({
            filePath: pathJoin(buildContext.themeSrcDirPath, fileRelativePath),
            sourceCode
        });
    }

    return sourceCode;
}
