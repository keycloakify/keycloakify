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
    isOwnershipAction: boolean;
    uiModuleDirPath: string;
    uiModuleName: string;
    uiModuleVersion: string;
}): Promise<Buffer> {
    const {
        buildContext,
        uiModuleDirPath,
        fileRelativePath,
        isOwnershipAction,
        uiModuleName,
        uiModuleVersion
    } = params;

    let sourceCode = (
        await fsPr.readFile(pathJoin(uiModuleDirPath, KEYCLOAK_THEME, fileRelativePath))
    ).toString("utf8");

    sourceCode = addCommentToSourceCode({
        sourceCode,
        fileRelativePath,
        commentLines: (() => {
            const path = fileRelativePath.split(pathSep).join("/");

            return isOwnershipAction
                ? [
                      `This file has been claimed for ownership from ${uiModuleName} version ${uiModuleVersion}.`,
                      `To relinquish ownership and restore this file to its original content, run the following command:`,
                      ``,
                      `$ npx keycloakify own --revert --path '${path}'`
                  ]
                : [
                      `WARNING: Before modifying this file, run the following command:`,
                      ``,
                      `$ npx keycloakify own --path '${path}'`,
                      ``,
                      `This file is provided by ${uiModuleName} version ${uiModuleVersion}.`,
                      `It was copied into your repository by the postinstall script: \`keycloakify postinstall\`.`
                  ];
        })()
    });

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

function addCommentToSourceCode(params: {
    sourceCode: string;
    fileRelativePath: string;
    commentLines: string[];
}): string {
    const { sourceCode, fileRelativePath, commentLines } = params;

    const toResult = (comment: string) => {
        return [comment, ``, sourceCode].join("\n");
    };

    for (const ext of [".ts", ".tsx", ".css", ".less", ".sass", ".js", ".jsx"]) {
        if (!fileRelativePath.endsWith(ext)) {
            continue;
        }

        return toResult(
            [`/**`, ...commentLines.map(line => ` * ${line}`), ` */`].join("\n")
        );
    }

    if (fileRelativePath.endsWith(".properties")) {
        return toResult(commentLines.map(line => `# ${line}`).join("\n"));
    }

    if (fileRelativePath.endsWith(".html") || fileRelativePath.endsWith(".svg")) {
        const comment = [
            `<!--`,
            ...commentLines.map(
                line =>
                    ` ${line.replace("--path", "-p").replace("Before modifying", "Before modifying or replacing")}`
            ),
            `-->`
        ].join("\n");

        if (fileRelativePath.endsWith(".html") && sourceCode.trim().startsWith("<!")) {
            const [first, ...rest] = sourceCode.split(">");

            const last = rest.join(">");

            return [`${first}>`, comment, last].join("\n");
        }

        if (fileRelativePath.endsWith(".svg") && sourceCode.trim().startsWith("<?")) {
            const [first, ...rest] = sourceCode.split("?>");

            const last = rest.join("?>");

            return [`${first}?>`, comment, last].join("\n");
        }

        return toResult(comment);
    }

    return sourceCode;
}
