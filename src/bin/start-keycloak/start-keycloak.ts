import { readBuildOptions } from "../shared/buildOptions";
import type { CliCommandOptions as CliCommandOptions_common } from "../main";
import { promptKeycloakVersion } from "../shared/promptKeycloakVersion";
import { readMetaInfKeycloakThemes } from "../shared/metaInfKeycloakThemes";
import { accountV1ThemeName, containerName } from "../shared/constants";
import { SemVer } from "../tools/SemVer";
import type { KeycloakVersionRange } from "../shared/KeycloakVersionRange";
import { getJarFileBasename } from "../shared/getJarFileBasename";
import { assert, type Equals } from "tsafe/assert";
import * as fs from "fs";
import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
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

    const buildOptions = readBuildOptions({ cliCommandOptions });

    {
        const { isAppBuildSuccess } = await appBuild({
            doSkipIfReactAppBuildDirExists: true,
            buildOptions
        });

        if (!isAppBuildSuccess) {
            console.log(
                chalk.red(
                    `App build failed, exiting. Try running 'yarn build-keycloak-theme' and see what's wrong.`
                )
            );
            process.exit(1);
        }

        const { isKeycloakifyBuildSuccess } = await keycloakifyBuild({
            doSkipBuildJars: false,
            buildOptions
        });

        if (!isKeycloakifyBuildSuccess) {
            console.log(
                chalk.red(
                    `Keycloakify build failed, exiting. Try running 'yarn build-keycloak-theme' and see what's wrong.`
                )
            );
            process.exit(1);
        }
    }

    const metaInfKeycloakThemes = readMetaInfKeycloakThemes({
        keycloakifyBuildDirPath: buildOptions.keycloakifyBuildDirPath
    });

    const doesImplementAccountTheme = metaInfKeycloakThemes.themes.some(
        ({ name }) => name === accountV1ThemeName
    );

    const { keycloakVersion, keycloakMajorNumber: keycloakMajorVersionNumber } =
        await (async function getKeycloakMajor(): Promise<{
            keycloakVersion: string;
            keycloakMajorNumber: number;
        }> {
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
                startingFromMajor: 17,
                cacheDirPath: buildOptions.cacheDirPath
            });

            console.log(`→ ${keycloakVersion}`);

            const keycloakMajorNumber = SemVer.parse(keycloakVersion).major;

            if (doesImplementAccountTheme && keycloakMajorNumber === 22) {
                console.log(
                    [
                        "Unfortunately, Keycloakify themes that implements an account theme do not work on Keycloak 22",
                        "Please select any other Keycloak version"
                    ].join(" ")
                );
                return getKeycloakMajor();
            }

            return { keycloakVersion, keycloakMajorNumber };
        })();

    const keycloakVersionRange: KeycloakVersionRange = (() => {
        if (doesImplementAccountTheme) {
            const keycloakVersionRange = (() => {
                if (keycloakMajorVersionNumber <= 21) {
                    return "21-and-below" as const;
                }

                assert(keycloakMajorVersionNumber !== 22);

                if (keycloakMajorVersionNumber === 23) {
                    return "23" as const;
                }

                return "24-and-above" as const;
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

    console.log(`Using Keycloak ${chalk.bold(jarFileBasename)}`);

    try {
        child_process.execSync(`docker rm --force ${containerName}`, {
            stdio: "ignore"
        });
    } catch {}

    const realmJsonFilePath = await (async () => {
        if (cliCommandOptions.realmJsonFilePath !== undefined) {
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

    const jarFilePath = pathJoin(buildOptions.keycloakifyBuildDirPath, jarFileBasename);

    const { doUseBuiltInAccountV1Theme } = await (async () => {
        let doUseBuiltInAccountV1Theme = false;

        await extractArchive({
            archiveFilePath: jarFilePath,
            onArchiveFile: async ({ relativeFilePathInArchive, readFile, earlyExit }) => {
                for (const themeName of buildOptions.themeNames) {
                    if (
                        relativeFilePathInArchive ===
                        pathJoin("theme", themeName, "account", "theme.properties")
                    ) {
                        if (
                            (await readFile())
                                .toString("utf8")
                                .includes(`parent=keycloak`)
                        ) {
                            doUseBuiltInAccountV1Theme = true;
                        }

                        earlyExit();
                    }
                }
            }
        });

        return { doUseBuiltInAccountV1Theme };
    })();

    const accountThemePropertyPatch = !doUseBuiltInAccountV1Theme
        ? undefined
        : () => {
              for (const themeName of buildOptions.themeNames) {
                  const filePath = pathJoin(
                      buildOptions.keycloakifyBuildDirPath,
                      "src",
                      "main",
                      "resources",
                      "theme",
                      themeName,
                      "account",
                      "theme.properties"
                  );

                  const sourceCode = fs.readFileSync(filePath);

                  const modifiedSourceCode = Buffer.from(
                      sourceCode
                          .toString("utf8")
                          .replace(`parent=${accountV1ThemeName}`, "parent=keycloak"),
                      "utf8"
                  );

                  assert(Buffer.compare(modifiedSourceCode, sourceCode) !== 0);

                  fs.writeFileSync(filePath, modifiedSourceCode);
              }
          };

    accountThemePropertyPatch?.();

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
            ...["-v", `${jarFilePath}:/opt/keycloak/providers/keycloak-theme.jar`],
            ...(keycloakMajorVersionNumber <= 20
                ? ["-e", "JAVA_OPTS=-Dkeycloak.profile=preview"]
                : []),
            ...[
                ...buildOptions.themeNames,
                ...(doLinkAccountV1Theme ? [accountV1ThemeName] : [])
            ]
                .map(themeName => ({
                    localDirPath: pathJoin(
                        buildOptions.keycloakifyBuildDirPath,
                        "src",
                        "main",
                        "resources",
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
            `quay.io/keycloak/keycloak:${keycloakVersion}`,
            "start-dev",
            ...(21 <= keycloakMajorVersionNumber && keycloakMajorVersionNumber < 24
                ? ["--features=declarative-user-profile"]
                : []),
            ...(realmJsonFilePath === undefined ? [] : ["--import-realm"])
        ],
        {
            cwd: buildOptions.keycloakifyBuildDirPath
        }
    ] as const;

    const child = child_process.spawn(...spawnArgs);

    child.stdout.on("data", data => process.stdout.write(data));

    child.stderr.on("data", data => process.stderr.write(data));

    child.on("exit", process.exit);

    const srcDirPath = pathJoin(buildOptions.reactAppRootDirPath, "src");

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
                    `${chalk.green("Your theme is accessible at:")}`,
                    `${chalk.green("➜")} ${chalk.cyan.bold(
                        "https://my-theme.keycloakify.dev/"
                    )}`,
                    "",
                    "You can login with the following credentials:",
                    `- username: ${chalk.cyan.bold("testuser")}`,
                    `- password: ${chalk.cyan.bold("password123")}`,
                    "",
                    `Keycloak Admin console: ${chalk.cyan.bold(
                        `http://localhost:${cliCommandOptions.port}`
                    )}`,
                    `- user:     ${chalk.cyan.bold("admin")}`,
                    `- password: ${chalk.cyan.bold("admin")}`,
                    "",
                    `Watching for changes in ${chalk.bold(
                        `.${pathSep}${pathRelative(process.cwd(), srcDirPath)}`
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
                doSkipIfReactAppBuildDirExists: false,
                buildOptions
            });

            if (!isAppBuildSuccess) {
                return;
            }

            const { isKeycloakifyBuildSuccess } = await keycloakifyBuild({
                doSkipBuildJars: true,
                buildOptions
            });

            if (!isKeycloakifyBuildSuccess) {
                return;
            }

            accountThemePropertyPatch?.();

            console.log(chalk.green("Theme rebuilt and updated in Keycloak."));
        });

        const { waitForDebounce } = waitForDebounceFactory({ delay: 400 });

        chokidar
            .watch([srcDirPath, pathJoin(getThisCodebaseRootDirPath(), "src")], {
                ignoreInitial: true
            })
            .on("all", async () => {
                await waitForDebounce();

                runFullBuild();
            });
    }
}
