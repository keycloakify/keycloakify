import { getIsPrettierAvailable, runPrettier } from "../tools/runPrettier";
import * as fsPr from "fs/promises";
import { join as pathJoin, sep as pathSep } from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import { KEYCLOAK_THEME } from "../shared/constants";

export type BuildContextLike = {
    themeSrcDirPath: string;
    publicDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function getExtensionModuleFileSourceCodeReadyToBeCopied(params: {
    buildContext: BuildContextLike;
    isPublic: boolean;
    fileRelativePath: string;
    isOwnershipAction: boolean;
    extensionModuleDirPath: string;
    extensionModuleName: string;
    extensionModuleVersion: string;
}): Promise<Buffer> {
    const {
        buildContext,
        extensionModuleDirPath,
        isPublic,
        fileRelativePath,
        isOwnershipAction,
        extensionModuleName,
        extensionModuleVersion
    } = params;

    let sourceCode = (
        await fsPr.readFile(
            pathJoin(extensionModuleDirPath, KEYCLOAK_THEME, fileRelativePath)
        )
    ).toString("utf8");

    add_eslint_disable: {
        if (isOwnershipAction) {
            break add_eslint_disable;
        }

        if (!fileRelativePath.endsWith(".ts") && !fileRelativePath.endsWith(".tsx")) {
            break add_eslint_disable;
        }

        if (sourceCode.includes("/* eslint-disable */")) {
            break add_eslint_disable;
        }

        sourceCode = ["/* eslint-disable */", "", sourceCode].join("\n");
    }

    sourceCode = addCommentToSourceCode({
        sourceCode,
        fileRelativePath,
        commentLines: (() => {
            const path = fileRelativePath.split(pathSep).join("/");

            return isOwnershipAction
                ? [
                      `This file has been claimed for ownership from ${extensionModuleName} version ${extensionModuleVersion}.`,
                      `To relinquish ownership and restore this file to its original content, run the following command:`,
                      ``,
                      `$ npx keycloakify own --path "${path}" ${isPublic ? "--public " : ""}--revert`
                  ]
                : [
                      `WARNING: Before modifying this file, run the following command:`,
                      ``,
                      `$ npx keycloakify own --path "${path}"${isPublic ? " --public" : ""}`,
                      ``,
                      `This file is provided by ${extensionModuleName} version ${extensionModuleVersion}.`,
                      `It was copied into your repository by the postinstall script: \`keycloakify sync-extensions\`.`
                  ];
        })()
    });

    const destFilePath = pathJoin(
        isPublic
            ? pathJoin(buildContext.publicDirPath, KEYCLOAK_THEME)
            : buildContext.themeSrcDirPath,
        fileRelativePath
    );

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

    if (fileRelativePath.endsWith(".ftl")) {
        const comment = [`<#--`, ...commentLines.map(line => `  ${line}`), `-->`].join(
            "\n"
        );

        if (sourceCode.trim().startsWith("<#ftl")) {
            const [first, ...rest] = sourceCode.split(">");

            const last = rest.join(">");

            return [`${first}>`, comment, last].join("\n");
        }

        return toResult(comment);
    }

    if (fileRelativePath.endsWith(".html") || fileRelativePath.endsWith(".svg")) {
        const comment = [
            `<!--`,
            ...commentLines.map(
                line =>
                    ` ${line
                        .replace("--path", "-t")
                        .replace("--revert", "-r")
                        .replace("Before modifying", "Before modifying or replacing")}`
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
