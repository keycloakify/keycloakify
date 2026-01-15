import { getIsPrettierAvailable, runPrettier } from "../tools/runPrettier";
import * as fsPr from "fs/promises";
import { join as pathJoin, sep as pathSep } from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import {
    KEYCLOAK_THEME,
    THEME_TYPES,
    EARLY_COLOR_SCHEME_SCRIPT_BASENAME
} from "../shared/constants";

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

    const { refSourceCode } = await (async () => {
        let sourceCode: string | undefined = undefined;

        const sourceCode_originalBuffer = await fsPr.readFile(
            pathJoin(
                extensionModuleDirPath,
                KEYCLOAK_THEME,
                isPublic ? "public" : ".",
                fileRelativePath
            )
        );

        let hasBeenUpdated = false;

        const refSourceCode = {
            get current(): string {
                if (sourceCode === undefined) {
                    sourceCode = sourceCode_originalBuffer.toString("utf8");
                }

                return sourceCode;
            },
            set current(value: string) {
                hasBeenUpdated = true;
                sourceCode = value;
            },
            getAsBuffer: () => {
                if (!hasBeenUpdated) {
                    return sourceCode_originalBuffer;
                }

                return Buffer.from(refSourceCode.current, "utf8");
            }
        };

        return { refSourceCode };
    })();

    add_eslint_disable: {
        if (isOwnershipAction) {
            break add_eslint_disable;
        }

        if (!fileRelativePath.endsWith(".ts") && !fileRelativePath.endsWith(".tsx")) {
            break add_eslint_disable;
        }

        if (refSourceCode.current.includes("/* eslint-disable */")) {
            break add_eslint_disable;
        }

        refSourceCode.current = ["/* eslint-disable */", "", refSourceCode.current].join(
            "\n"
        );
    }

    addCommentToSourceCode({
        refSourceCode,
        fileRelativePath,
        commentLines: (() => {
            const path = fileRelativePath.split(pathSep).join("/");

            const isEarlyColorSchemeScript =
                isPublic &&
                THEME_TYPES.find(
                    themeType =>
                        pathJoin(themeType, EARLY_COLOR_SCHEME_SCRIPT_BASENAME) ===
                        fileRelativePath
                ) !== undefined;

            const common = !isEarlyColorSchemeScript
                ? []
                : [
                      ``,
                      `${EARLY_COLOR_SCHEME_SCRIPT_BASENAME} is a special file that will be imported in the head automatically by Keycloakify.`,
                      `Note that this file is not loaded in Storybook or when using the Vite DEV server.`,
                      "To test it you can use `NO_DEV_SERVER=true npx keycloakify start-keycloak` (NO_DEV_SERVER is only relevant for Account SPA and Admin themes)"
                  ];

            return isOwnershipAction
                ? [
                      `This file has been claimed for ownership from ${extensionModuleName} version ${extensionModuleVersion}.`,
                      `To relinquish ownership and restore this file to its original content, run the following command:`,
                      ``,
                      `$ npx keycloakify own --path "${path}" ${isPublic ? "--public " : ""}--revert`,
                      ...common
                  ]
                : [
                      `WARNING: Before modifying this file, run the following command:`,
                      ``,
                      `$ npx keycloakify own --path "${path}"${isPublic ? " --public" : ""}`,
                      ``,
                      `This file is provided by ${extensionModuleName} version ${extensionModuleVersion}.`,
                      `It was copied into your repository by the postinstall script: \`keycloakify sync-extensions\`.`,
                      ...common
                  ];
        })()
    });

    format: {
        if (!(await getIsPrettierAvailable())) {
            break format;
        }

        const sourceCode_buffer_before = refSourceCode.getAsBuffer();
        const sourceCode_buffer_after = await runPrettier({
            filePath: pathJoin(
                isPublic
                    ? pathJoin(buildContext.publicDirPath, KEYCLOAK_THEME)
                    : buildContext.themeSrcDirPath,
                fileRelativePath
            ),
            sourceCode: sourceCode_buffer_before
        });

        if (sourceCode_buffer_before.compare(sourceCode_buffer_after) === 0) {
            break format;
        }

        refSourceCode.current = sourceCode_buffer_after.toString("utf8");
    }

    return refSourceCode.getAsBuffer();
}

function addCommentToSourceCode(params: {
    refSourceCode: { current: string };
    fileRelativePath: string;
    commentLines: string[];
}): void {
    const { refSourceCode, fileRelativePath, commentLines } = params;

    const updateRef = (comment: string) => {
        refSourceCode.current = [comment, ``, refSourceCode.current].join("\n");
    };

    for (const ext of [".ts", ".tsx", ".css", ".less", ".sass", ".js", ".jsx"]) {
        if (!fileRelativePath.endsWith(ext)) {
            continue;
        }

        updateRef([`/**`, ...commentLines.map(line => ` * ${line}`), ` */`].join("\n"));
        return;
    }

    if (fileRelativePath.endsWith(".properties")) {
        updateRef(commentLines.map(line => `# ${line}`).join("\n"));
        return;
    }

    if (fileRelativePath.endsWith(".ftl")) {
        const comment = [`<#--`, ...commentLines.map(line => `  ${line}`), `-->`].join(
            "\n"
        );

        if (refSourceCode.current.trim().startsWith("<#ftl")) {
            const [first, ...rest] = refSourceCode.current.split(">");

            const last = rest.join(">");

            refSourceCode.current = [`${first}>`, comment, last].join("\n");
            return;
        }

        updateRef(comment);
        return;
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

        if (
            fileRelativePath.endsWith(".html") &&
            refSourceCode.current.trim().startsWith("<!")
        ) {
            const [first, ...rest] = refSourceCode.current.split(">");

            const last = rest.join(">");

            refSourceCode.current = [`${first}>`, comment, last].join("\n");
            return;
        }

        if (
            fileRelativePath.endsWith(".svg") &&
            refSourceCode.current.trim().startsWith("<?")
        ) {
            const [first, ...rest] = refSourceCode.current.split("?>");

            const last = rest.join("?>");

            refSourceCode.current = [`${first}?>`, comment, last].join("\n");
            return;
        }

        updateRef(comment);
        return;
    }
}
