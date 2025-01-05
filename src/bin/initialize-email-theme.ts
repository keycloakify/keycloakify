import type { BuildContext } from "./shared/buildContext";
import cliSelect from "cli-select";
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import { exitIfUncommittedChanges } from "./shared/exitIfUncommittedChanges";

import { dirname as pathDirname, join as pathJoin, relative as pathRelative } from "path";
import * as fs from "fs";
import { assert, is, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";
import { addSyncExtensionsToPostinstallScript } from "./shared/addSyncExtensionsToPostinstallScript";
import { getIsPrettierAvailable, runPrettier } from "./tools/runPrettier";
import { npmInstall } from "./tools/npmInstall";
import * as child_process from "child_process";
import { z } from "zod";
import chalk from "chalk";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = maybeDelegateCommandToCustomHandler({
        commandName: "initialize-account-theme",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    exitIfUncommittedChanges({
        projectDirPath: buildContext.projectDirPath
    });

    const emailThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "email");

    if (
        fs.existsSync(emailThemeSrcDirPath) &&
        fs.readdirSync(emailThemeSrcDirPath).length > 0
    ) {
        console.warn(
            chalk.red(
                `There is already a ${pathRelative(
                    process.cwd(),
                    emailThemeSrcDirPath
                )} directory in your project. Aborting.`
            )
        );

        process.exit(-1);
    }

    const { value: emailThemeType } = await cliSelect({
        values: ["native (FreeMarker)" as const, "jsx-email (React)" as const]
    }).catch(() => {
        process.exit(-1);
    });

    if (emailThemeType === "jsx-email (React)") {
        console.log(
            [
                "There is currently no automated support for keycloakify-email, it has to be done manually, see documentation:",
                "https://docs.keycloakify.dev/theme-types/email-theme"
            ].join("\n")
        );

        process.exit(0);
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

    const moduleName = `@keycloakify/email-native`;

    const [version] = (
        JSON.parse(
            child_process
                .execSync(`npm show ${moduleName} versions --json`)
                .toString("utf8")
                .trim()
        ) as string[]
    )
        .reverse()
        .filter(version => !version.includes("-"));

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

    console.log(chalk.green("Email theme initialized."));
}
