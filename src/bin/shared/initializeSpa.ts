import { dirname as pathDirname, join as pathJoin, relative as pathRelative } from "path";
import type { BuildContext } from "./buildContext";
import * as fs from "fs";
import * as fsPr from "fs/promises";
import { assert, is, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";
import {
    addSyncExtensionsToPostinstallScript,
    type BuildContextLike as BuildContextLike_addSyncExtensionsToPostinstallScript
} from "./addSyncExtensionsToPostinstallScript";
import { getIsPrettierAvailable, runPrettier } from "../tools/runPrettier";
import { npmInstall } from "../tools/npmInstall";
import * as child_process from "child_process";
import { z } from "zod";
import chalk from "chalk";
import { existsAsync } from "../tools/fs.existsAsync";

export type BuildContextLike = BuildContextLike_addSyncExtensionsToPostinstallScript & {
    themeSrcDirPath: string;
    packageJsonFilePath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function initializeSpa(params: {
    themeType: "account" | "admin";
    buildContext: BuildContextLike;
}) {
    const { themeType, buildContext } = params;

    {
        const themeTypeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, themeType);

        if (
            fs.existsSync(themeTypeSrcDirPath) &&
            fs.readdirSync(themeTypeSrcDirPath).length > 0
        ) {
            console.warn(
                chalk.red(
                    `There is already a ${pathRelative(
                        process.cwd(),
                        themeTypeSrcDirPath
                    )} directory in your project. Aborting.`
                )
            );

            process.exit(-1);
        }
    }

    const parsedPackageJson = (() => {
        type ParsedPackageJson = {
            scripts?: Record<string, string | undefined>;
            dependencies?: Record<string, string | undefined>;
            devDependencies?: Record<string, string | undefined>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zTargetType = z.object({
                scripts: z.record(z.union([z.string(), z.undefined()])).optional(),
                dependencies: z.record(z.union([z.string(), z.undefined()])).optional(),
                devDependencies: z.record(z.union([z.string(), z.undefined()])).optional()
            });

            assert<Equals<z.infer<typeof zTargetType>, TargetType>>;

            return id<z.ZodType<TargetType>>(zTargetType);
        })();
        const parsedPackageJson = JSON.parse(
            fs.readFileSync(buildContext.packageJsonFilePath).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return parsedPackageJson;
    })();

    addSyncExtensionsToPostinstallScript({
        parsedPackageJson,
        buildContext
    });

    await disableVerbatimModuleSyntax({
        projectDirPath: buildContext.projectDirPath
    });

    const uiSharedMajor = (() => {
        const dependencies = {
            ...parsedPackageJson.devDependencies,
            ...parsedPackageJson.dependencies
        };

        const version = dependencies["@keycloakify/keycloak-ui-shared"];

        if (version === undefined) {
            return undefined;
        }

        const match = version.match(/^[^~]?(\d+)\./);

        if (match === null) {
            return undefined;
        }

        return match[1];
    })();

    const moduleName = `@keycloakify/keycloak-${themeType}-ui`;

    const version = ((): string[] => {
        const cmdOutput = child_process
            .execSync(`npm show ${moduleName} versions --json`)
            .toString("utf8")
            .trim();

        const versions = JSON.parse(cmdOutput) as string | string[];

        // NOTE: Bug in some older npm versions
        if (typeof versions === "string") {
            return [versions];
        }

        return versions;
    })()
        .reverse()
        .filter(version => !version.includes("-"))
        .find(version =>
            uiSharedMajor === undefined ? true : version.startsWith(`${uiSharedMajor}.`)
        );

    assert(version !== undefined);

    (parsedPackageJson.dependencies ??= {})[moduleName] = `~${version}`;

    if (parsedPackageJson.devDependencies !== undefined) {
        delete parsedPackageJson.devDependencies[moduleName];
    }

    {
        let sourceCode = JSON.stringify(parsedPackageJson, undefined, 2);

        if (await getIsPrettierAvailable()) {
            sourceCode = await runPrettier({
                sourceCode,
                filePath: buildContext.packageJsonFilePath
            });
        }

        fs.writeFileSync(
            buildContext.packageJsonFilePath,
            Buffer.from(sourceCode, "utf8")
        );
    }

    await npmInstall({
        packageJsonDirPath: pathDirname(buildContext.packageJsonFilePath)
    });
}

async function disableVerbatimModuleSyntax(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    const filePath = pathJoin(projectDirPath, "tsconfig.app.json");

    if (!(await existsAsync(filePath))) {
        return;
    }

    let content = (await fsPr.readFile(filePath)).toString("utf8");

    const regExp = /"verbatimModuleSyntax"\s*:\s*true\s*(,?)/m;

    if (!regExp.test(content)) {
        return;
    }

    content = content.replace(regExp, `"verbatimModuleSyntax": false$1`);

    await fsPr.writeFile(filePath, Buffer.from(content, "utf8"));
}
