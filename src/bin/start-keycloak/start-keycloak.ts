import { getBuildContext } from "../shared/buildContext";
import { exclude } from "tsafe/exclude";
import type { CliCommandOptions as CliCommandOptions_common } from "../main";
import { promptKeycloakVersion } from "../shared/promptKeycloakVersion";
import { getImplementedThemeTypes } from "../shared/getImplementedThemeTypes";
import { accountV1ThemeName, containerName } from "../shared/constants";
import { SemVer } from "../tools/SemVer";
import type { KeycloakVersionRange } from "../shared/KeycloakVersionRange";
import { getJarFileBasename } from "../shared/getJarFileBasename";
import { assert, type Equals } from "tsafe/assert";
import * as fs from "fs";
import {
    join as pathJoin,
    relative as pathRelative,
    sep as pathSep,
    basename as pathBasename
} from "path";
import * as child_process from "child_process";
import chalk from "chalk";
import chokidar from "chokidar";
import { waitForDebounceFactory } from "powerhooks/tools/waitForDebounce";
import { getThisCodebaseRootDirPath } from "../tools/getThisCodebaseRootDirPath";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";
import cliSelect from "cli-select";
import * as runExclusive from "run-exclusive";
import { extractArchive } from "../tools/extractArchive";
import { appBuild } from "./appBuild";
import { keycloakifyBuild } from "./keycloakifyBuild";
import { isInside } from "../tools/isInside";
import { existsAsync } from "../tools/fs.existsAsync";
import { rm } from "../tools/fs.rm";

export type CliCommandOptions = CliCommandOptions_common & {
    port: number;
    keycloakVersion: string | undefined;
    realmJsonFilePath: string | undefined;
};

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    exit_if_docker_not_installed: {
        let commandOutput: Buffer | undefined = undefined;

        try {
            commandOutput = child_process.execSync("docker --version", {
                stdio: ["ignore", "pipe", "ignore"]
            });
        } catch {}

        if (commandOutput?.toString("utf8").includes("Docker")) {
            break exit_if_docker_not_installed;
        }

        console.log(
            [
                `${chalk.red("Docker required.")}`,
                `Install it with Docker Desktop: ${chalk.bold.underline(
                    "https://www.docker.com/products/docker-desktop/"
                )}`,
                `(or any other way)`
            ].join(" ")
        );

        process.exit(1);
    }

    exit_if_docker_not_running: {
        let isDockerRunning: boolean;

        try {
            child_process.execSync("docker info", { stdio: "ignore" });
            isDockerRunning = true;
        } catch {
            isDockerRunning = false;
        }

        if (isDockerRunning) {
            break exit_if_docker_not_running;
        }

        console.log(
            [
                `${chalk.red("Docker daemon is not running.")}`,
                `Please start Docker Desktop and try again.`
            ].join(" ")
        );

        process.exit(1);
    }

    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({ cliCommandOptions });

    const { keycloakVersion, keycloakMajorNumber: keycloakMajorVersionNumber } =
        await (async () => {
            if (cliCommandOptions.keycloakVersion !== undefined) {
                return {
                    keycloakVersion: cliCommandOptions.keycloakVersion,
                    keycloakMajorNumber: SemVer.parse(cliCommandOptions.keycloakVersion)
                        .major
                };
            }

            console.log(
                chalk.cyan("On which version of Keycloak do you want to test your theme?")
            );

            const { keycloakVersion } = await promptKeycloakVersion({
                startingFromMajor: 18,
                excludeMajorVersions: [22],
                cacheDirPath: buildContext.cacheDirPath
            });

            console.log(`→ ${keycloakVersion}`);

            const keycloakMajorNumber = SemVer.parse(keycloakVersion).major;

            return { keycloakVersion, keycloakMajorNumber };
        })();

    const keycloakVersionRange: KeycloakVersionRange = (() => {
        const doesImplementAccountTheme = getImplementedThemeTypes({
            projectDirPath: buildContext.projectDirPath
        }).implementedThemeTypes.account;

        if (doesImplementAccountTheme) {
            const keycloakVersionRange = (() => {
                if (keycloakMajorVersionNumber <= 21) {
                    return "21-and-below" as const;
                }

                assert(keycloakMajorVersionNumber !== 22);

                if (keycloakMajorVersionNumber === 23) {
                    return "23" as const;
                }

                if (keycloakMajorVersionNumber === 24) {
                    return "24" as const;
                }

                return "25-and-above" as const;
            })();

            assert<
                Equals<typeof keycloakVersionRange, KeycloakVersionRange.WithAccountTheme>
            >();

            return keycloakVersionRange;
        } else {
            const keycloakVersionRange = (() => {
                if (keycloakMajorVersionNumber <= 21) {
                    return "21-and-below" as const;
                }

                return "22-and-above" as const;
            })();

            assert<
                Equals<
                    typeof keycloakVersionRange,
                    KeycloakVersionRange.WithoutAccountTheme
                >
            >();

            return keycloakVersionRange;
        }
    })();

    const { jarFileBasename } = getJarFileBasename({ keycloakVersionRange });

    {
        const { isAppBuildSuccess } = await appBuild({
            buildContext
        });

        if (!isAppBuildSuccess) {
            console.log(
                chalk.red(
                    `App build failed, exiting. Try running 'npm run build-keycloak-theme' and see what's wrong.`
                )
            );
            process.exit(1);
        }

        const { isKeycloakifyBuildSuccess } = await keycloakifyBuild({
            onlyBuildJarFileBasename: jarFileBasename,
            buildContext
        });

        if (!isKeycloakifyBuildSuccess) {
            console.log(
                chalk.red(
                    `Keycloakify build failed, exiting. Try running 'npm run build-keycloak-theme' and see what's wrong.`
                )
            );
            process.exit(1);
        }
    }

    console.log(`Using Keycloak ${chalk.bold(jarFileBasename)}`);

    const realmJsonFilePath = await (async () => {
        if (cliCommandOptions.realmJsonFilePath !== undefined) {
            if (cliCommandOptions.realmJsonFilePath === "none") {
                return undefined;
            }

            console.log(
                chalk.green(
                    `Using realm json file: ${cliCommandOptions.realmJsonFilePath}`
                )
            );

            return getAbsoluteAndInOsFormatPath({
                pathIsh: cliCommandOptions.realmJsonFilePath,
                cwd: process.cwd()
            });
        }

        const internalFilePath = await (async () => {
            const dirPath = pathJoin(
                getThisCodebaseRootDirPath(),
                "src",
                "bin",
                "start-keycloak"
            );

            const filePath = pathJoin(
                dirPath,
                `myrealm-realm-${keycloakMajorVersionNumber}.json`
            );

            if (fs.existsSync(filePath)) {
                return filePath;
            }

            console.log(
                `${chalk.yellow(
                    `Keycloakify do not have a realm configuration for Keycloak ${keycloakMajorVersionNumber} yet.`
                )}`
            );

            console.log(chalk.cyan("Select what configuration to use:"));

            const { value } = await cliSelect<string>({
                values: [
                    ...fs
                        .readdirSync(dirPath)
                        .filter(fileBasename => fileBasename.endsWith(".json")),
                    "none"
                ]
            }).catch(() => {
                process.exit(-1);
            });

            if (value === "none") {
                return undefined;
            }

            return pathJoin(dirPath, value);
        })();

        if (internalFilePath === undefined) {
            return undefined;
        }

        const filePath = pathJoin(
            buildContext.cacheDirPath,
            pathBasename(internalFilePath)
        );

        fs.writeFileSync(
            filePath,
            Buffer.from(
                fs
                    .readFileSync(internalFilePath)
                    .toString("utf8")
                    .replace(/keycloakify\-starter/g, buildContext.themeNames[0])
            ),
            "utf8"
        );

        return filePath;
    })();

    const jarFilePath = pathJoin(buildContext.keycloakifyBuildDirPath, jarFileBasename);

    async function extractThemeResourcesFromJar() {
        await extractArchive({
            archiveFilePath: jarFilePath,
            onArchiveFile: async ({ relativeFilePathInArchive, writeFile }) => {
                if (isInside({ dirPath: "theme", filePath: relativeFilePathInArchive })) {
                    await writeFile({
                        filePath: pathJoin(
                            buildContext.keycloakifyBuildDirPath,
                            relativeFilePathInArchive
                        )
                    });
                }
            }
        });
    }

    {
        const destDirPath = pathJoin(buildContext.keycloakifyBuildDirPath, "theme");
        if (await existsAsync(destDirPath)) {
            await rm(destDirPath, { recursive: true });
        }
    }

    await extractThemeResourcesFromJar();

    const jarFilePath_cacheDir = pathJoin(buildContext.cacheDirPath, jarFileBasename);

    fs.copyFileSync(jarFilePath, jarFilePath_cacheDir);

    try {
        child_process.execSync(`docker rm --force ${containerName}`, {
            stdio: "ignore"
        });
    } catch {}

    const spawnArgs = [
        "docker",
        [
            "run",
            ...["-p", `${cliCommandOptions.port}:8080`],
            ...["--name", containerName],
            ...["-e", "KEYCLOAK_ADMIN=admin"],
            ...["-e", "KEYCLOAK_ADMIN_PASSWORD=admin"],
            ...(realmJsonFilePath === undefined
                ? []
                : [
                      "-v",
                      `${realmJsonFilePath}:/opt/keycloak/data/import/myrealm-realm.json`
                  ]),
            ...[
                "-v",
                `${jarFilePath_cacheDir}:/opt/keycloak/providers/keycloak-theme.jar`
            ],
            ...(keycloakMajorVersionNumber <= 20
                ? ["-e", "JAVA_OPTS=-Dkeycloak.profile=preview"]
                : []),
            ...[
                ...buildContext.themeNames,
                ...(fs.existsSync(
                    pathJoin(
                        buildContext.keycloakifyBuildDirPath,
                        "theme",
                        accountV1ThemeName
                    )
                )
                    ? [accountV1ThemeName]
                    : [])
            ]
                .map(themeName => ({
                    localDirPath: pathJoin(
                        buildContext.keycloakifyBuildDirPath,
                        "theme",
                        themeName
                    ),
                    containerDirPath: `/opt/keycloak/themes/${themeName}`
                }))
                .map(({ localDirPath, containerDirPath }) => [
                    "-v",
                    `${localDirPath}:${containerDirPath}:rw`
                ])
                .flat(),
            ...buildContext.environmentVariables
                .map(({ name }) => ({ name, envValue: process.env[name] }))
                .map(({ name, envValue }) =>
                    envValue === undefined ? undefined : { name, envValue }
                )
                .filter(exclude(undefined))
                .map(({ name, envValue }) => [
                    "--env",
                    `${name}='${envValue.replace(/'/g, "'\\''")}'`
                ])
                .flat(),
            `quay.io/keycloak/keycloak:${keycloakVersion}`,
            "start-dev",
            ...(21 <= keycloakMajorVersionNumber && keycloakMajorVersionNumber < 24
                ? ["--features=declarative-user-profile"]
                : []),
            ...(realmJsonFilePath === undefined ? [] : ["--import-realm"])
        ],
        {
            cwd: buildContext.keycloakifyBuildDirPath,
            shell: true
        }
    ] as const;

    const child = child_process.spawn(...spawnArgs);

    child.stdout.on("data", data => process.stdout.write(data));

    child.stderr.on("data", data => process.stderr.write(data));

    child.on("exit", process.exit);

    const srcDirPath = pathJoin(buildContext.projectDirPath, "src");

    {
        const handler = async (data: Buffer) => {
            if (!data.toString("utf8").includes("Listening on: http://0.0.0.0:8080")) {
                return;
            }

            child.stdout.off("data", handler);

            await new Promise(resolve => setTimeout(resolve, 1_000));

            console.log(
                [
                    "",
                    `Keycloak Admin console: ${chalk.cyan.bold(
                        `http://localhost:${cliCommandOptions.port}`
                    )}`,
                    `- user:     ${chalk.cyan.bold("admin")}`,
                    `- password: ${chalk.cyan.bold("admin")}`,
                    "",
                    "",
                    `${chalk.green("Your theme is accessible at:")}`,
                    `${chalk.green("➜")} ${chalk.cyan.bold(
                        `https://my-theme.keycloakify.dev${cliCommandOptions.port === 8080 ? "" : `?port=${cliCommandOptions.port}`}`
                    )}`,
                    "",
                    "You can login with the following credentials:",
                    `- username: ${chalk.cyan.bold("testuser")}`,
                    `- password: ${chalk.cyan.bold("password123")}`,
                    "",
                    `Watching for changes in ${chalk.bold(
                        `.${pathSep}${pathRelative(process.cwd(), buildContext.projectDirPath)}`
                    )}`
                ].join("\n")
            );
        };

        child.stdout.on("data", handler);
    }

    {
        const runFullBuild = runExclusive.build(async () => {
            console.log(chalk.cyan("Detected changes in the theme. Rebuilding ..."));

            const { isAppBuildSuccess } = await appBuild({
                buildContext
            });

            if (!isAppBuildSuccess) {
                return;
            }

            const { isKeycloakifyBuildSuccess } = await keycloakifyBuild({
                onlyBuildJarFileBasename: jarFileBasename,
                buildContext
            });

            if (!isKeycloakifyBuildSuccess) {
                return;
            }

            await extractThemeResourcesFromJar();

            console.log(chalk.green("Theme rebuilt and updated in Keycloak."));
        });

        const { waitForDebounce } = waitForDebounceFactory({ delay: 400 });

        chokidar
            .watch(
                [
                    srcDirPath,
                    buildContext.publicDirPath,
                    pathJoin(buildContext.projectDirPath, "package.json"),
                    pathJoin(buildContext.projectDirPath, "vite.config.ts"),
                    pathJoin(buildContext.projectDirPath, "vite.config.js"),
                    pathJoin(buildContext.projectDirPath, "index.html"),
                    pathJoin(getThisCodebaseRootDirPath(), "src")
                ],
                {
                    ignoreInitial: true
                }
            )
            .on("all", async (...[, filePath]) => {
                console.log(`Detected changes in ${filePath}`);

                await waitForDebounce();

                runFullBuild();
            });
    }
}
