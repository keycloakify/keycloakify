import { getIsPrettierAvailable, runPrettier } from "../tools/runPrettier";
import * as fsPr from "fs/promises";
import { join as pathJoin, sep as pathSep } from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import { KEYCLOAK_THEME } from "../shared/constants";

export type BuildContextLike = {
    themeSrcDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function getUiModuleFileSourceCodeReadyToBeCopied(params: {
    buildContext: BuildContextLike;
    fileRelativePath: string;
    isForEjection: boolean;
    uiModuleDirPath: string;
    uiModuleName: string;
    uiModuleVersion: string;
}): Promise<Buffer> {
    const {
        buildContext,
        uiModuleDirPath,
        fileRelativePath,
        isForEjection,
        uiModuleName,
        uiModuleVersion
    } = params;

    let sourceCode = (
        await fsPr.readFile(pathJoin(uiModuleDirPath, KEYCLOAK_THEME, fileRelativePath))
    ).toString("utf8");

    const comment = (() => {
        if (isForEjection) {
            return [
                `/*`,
                ` * This file was ejected from ${uiModuleName} version ${uiModuleVersion}.`,
                ` */`
            ].join("\n");
        } else {
            return [
                `/*`,
                ` *`,
                ` * WARNING: Before modifying this file run the following command:`,
                ` * `,
                ` * $ npx keycloakify eject-file --file ${fileRelativePath.split(pathSep).join("/")}`,
                ` * `,
                ` * This file comes from ${uiModuleName} version ${uiModuleVersion}.`,
                ` *`,
                ` */`
            ].join("\n");
        }
    })();

    sourceCode = [comment, ``, sourceCode].join("\n");

    const destFilePath = pathJoin(buildContext.themeSrcDirPath, fileRelativePath);

    format: {
        if (!(await getIsPrettierAvailable())) {
            break format;
        }

        sourceCode = await runPrettier({
            filePath: destFilePath,
            sourceCode
        });
    }

    return Buffer.from(sourceCode, "utf8");
}