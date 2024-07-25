import { relative as pathRelative, dirname as pathDirname } from "path";
import type { BuildContext } from "../shared/buildContext";
import * as fs from "fs";
import chalk from "chalk";
import { getLatestsSemVersionedTag } from "../shared/getLatestsSemVersionedTag";
import fetch from "make-fetch-happen";
import { z } from "zod";
import { assert, type Equals } from "tsafe/assert";
import { is } from "tsafe/is";
import { id } from "tsafe/id";
import { npmInstall } from "../tools/npmInstall";
import { copyBoilerplate } from "./copyBoilerplate";

type BuildContextLike = {
    cacheDirPath: string;
    fetchOptions: BuildContext["fetchOptions"];
    packageJsonFilePath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function initializeAccountTheme_singlePage(params: {
    accountThemeSrcDirPath: string;
    buildContext: BuildContextLike;
}) {
    const { accountThemeSrcDirPath, buildContext } = params;

    const OWNER = "keycloakify";
    const REPO = "keycloak-account-ui";

    const [semVersionedTag] = await getLatestsSemVersionedTag({
        cacheDirPath: buildContext.cacheDirPath,
        owner: OWNER,
        repo: REPO,
        count: 1,
        doIgnoreReleaseCandidates: false
    });

    const dependencies = await fetch(
        `https://raw.githubusercontent.com/${OWNER}/${REPO}/${semVersionedTag.tag}/dependencies.gen.json`,
        buildContext.fetchOptions
    )
        .then(r => r.json())
        .then(
            (() => {
                type Dependencies = {
                    dependencies: Record<string, string>;
                    devDependencies?: Record<string, string>;
                };

                const zDependencies = (() => {
                    type TargetType = Dependencies;

                    const zTargetType = z.object({
                        dependencies: z.record(z.string()),
                        devDependencies: z.record(z.string()).optional()
                    });

                    assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

                    return id<z.ZodType<TargetType>>(zTargetType);
                })();

                return o => zDependencies.parse(o);
            })()
        );

    dependencies.dependencies["@keycloakify/keycloak-account-ui"] = semVersionedTag.tag;

    const parsedPackageJson = (() => {
        type ParsedPackageJson = {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zTargetType = z.object({
                dependencies: z.record(z.string()).optional(),
                devDependencies: z.record(z.string()).optional()
            });

            assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

            return id<z.ZodType<TargetType>>(zTargetType);
        })();
        const parsedPackageJson = JSON.parse(
            fs.readFileSync(buildContext.packageJsonFilePath).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return parsedPackageJson;
    })();

    parsedPackageJson.dependencies = {
        ...parsedPackageJson.dependencies,
        ...dependencies.dependencies
    };

    parsedPackageJson.devDependencies = {
        ...parsedPackageJson.devDependencies,
        ...dependencies.devDependencies
    };

    if (Object.keys(parsedPackageJson.devDependencies).length === 0) {
        delete parsedPackageJson.devDependencies;
    }

    fs.writeFileSync(
        buildContext.packageJsonFilePath,
        JSON.stringify(parsedPackageJson, undefined, 4)
    );

    npmInstall({ packageJsonDirPath: pathDirname(buildContext.packageJsonFilePath) });

    copyBoilerplate({
        accountThemeType: "Single-Page",
        accountThemeSrcDirPath
    });

    console.log(
        [
            chalk.green(
                "The Single-Page account theme has been successfully initialized."
            ),
            `Using Account UI of Keycloak version: ${chalk.bold(semVersionedTag.tag.split("-")[0])}`,
            `Directory created: ${chalk.bold(pathRelative(process.cwd(), accountThemeSrcDirPath))}`,
            `Dependencies added to your project's package.json: `,
            chalk.bold(JSON.stringify(dependencies, null, 2))
        ].join("\n")
    );
}
