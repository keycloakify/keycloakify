import { getBuildContext } from "../shared/buildContext";
import { exclude } from "tsafe/exclude";
import type { CliCommandOptions as CliCommandOptions_common } from "../main";
import { promptKeycloakVersion } from "../shared/promptKeycloakVersion";
import { ACCOUNT_V1_THEME_NAME, CONTAINER_NAME } from "../shared/constants";
import { SemVer } from "../tools/SemVer";
import { assert, type Equals } from "tsafe/assert";
import * as fs from "fs";
import {
    join as pathJoin,
    relative as pathRelative,
    sep as pathSep,
    basename as pathBasename,
    dirname as pathDirname
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
import { downloadAndExtractArchive } from "../tools/downloadAndExtractArchive";

export type CliCommandOptions = CliCommandOptions_common & {
    port: number | undefined;
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

    const { dockerImageTag } = await (async () => {
        if (cliCommandOptions.keycloakVersion !== undefined) {
            return { dockerImageTag: cliCommandOptions.keycloakVersion };
        }

        if (buildContext.startKeycloakOptions.dockerImage !== undefined) {
            return {
                dockerImageTag: buildContext.startKeycloakOptions.dockerImage.tag
            };
        }

        console.log(
            [
                chalk.cyan(
                    "On which version of Keycloak do you want to test your theme?"
                ),
                chalk.gray(
                    "You can also explicitly provide the version with `npx keycloakify start-keycloak --keycloak-version 25.0.2` (or any other version)"
                )
            ].join("\n")
        );

        const { keycloakVersion } = await promptKeycloakVersion({
            startingFromMajor: 18,
            excludeMajorVersions: [22],
            buildContext
        });

        console.log(`→ ${keycloakVersion}`);

        return { dockerImageTag: keycloakVersion };
    })();

    const keycloakMajorVersionNumber = (() => {
        if (buildContext.startKeycloakOptions.dockerImage === undefined) {
            return SemVer.parse(dockerImageTag).major;
        }

        const { tag } = buildContext.startKeycloakOptions.dockerImage;

        const [wrap] = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
            .map(majorVersionNumber => ({
                majorVersionNumber,
                index: tag.indexOf(`${majorVersionNumber}`)
            }))
            .filter(({ index }) => index !== -1)
            .sort((a, b) => a.index - b.index);

        if (wrap === undefined) {
            console.warn(
                chalk.yellow(
                    `Could not determine the major Keycloak version number from the docker image tag ${tag}. Assuming 25`
                )
            );
            return 25;
        }

        return wrap.majorVersionNumber;
    })();

    {
        const { isAppBuildSuccess } = await appBuild({
            buildContext
        });

        if (!isAppBuildSuccess) {
            console.log(
                chalk.red(
                    `App build failed, exiting. Try building your app (e.g 'npm run build') and see what's wrong.`
                )
            );
            process.exit(1);
        }

        const { isKeycloakifyBuildSuccess } = await keycloakifyBuild({
            buildForKeycloakMajorVersionNumber: keycloakMajorVersionNumber,
            buildContext
        });

        if (!isKeycloakifyBuildSuccess) {
            console.log(
                chalk.red(
                    `Keycloakify build failed, exiting. Try running 'npx keycloakify build' and see what's wrong.`
                )
            );
            process.exit(1);
        }
    }

    const jarFilePath = fs
        .readdirSync(buildContext.keycloakifyBuildDirPath)
        .filter(fileBasename => fileBasename.endsWith(".jar"))
        .map(fileBasename => pathJoin(buildContext.keycloakifyBuildDirPath, fileBasename))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];

    assert(jarFilePath !== undefined);

    const extensionJarFilePaths = await Promise.all(
        buildContext.startKeycloakOptions.extensionJars.map(async extensionJar => {
            switch (extensionJar.type) {
                case "path": {
                    assert(
                        await existsAsync(extensionJar.path),
                        `${extensionJar.path} does not exist`
                    );
                    return extensionJar.path;
                }
                case "url": {
                    const { archiveFilePath } = await downloadAndExtractArchive({
                        cacheDirPath: buildContext.cacheDirPath,
                        fetchOptions: buildContext.fetchOptions,
                        url: extensionJar.url,
                        uniqueIdOfOnArchiveFile: "no extraction",
                        onArchiveFile: async () => {}
                    });
                    return archiveFilePath;
                }
            }
            assert<Equals<typeof extensionJar, never>>(false);
        })
    );

    const getRealmJsonFilePath_defaultForKeycloakMajor = (
        keycloakMajorVersionNumber: number
    ) =>
        pathJoin(
            getThisCodebaseRootDirPath(),
            "src",
            "bin",
            "start-keycloak",
            `myrealm-realm-${keycloakMajorVersionNumber}.json`
        );

    const realmJsonFilePath = await (async () => {
        if (cliCommandOptions.realmJsonFilePath !== undefined) {
            if (cliCommandOptions.realmJsonFilePath === "none") {
                return undefined;
            }
            return getAbsoluteAndInOsFormatPath({
                pathIsh: cliCommandOptions.realmJsonFilePath,
                cwd: process.cwd()
            });
        }

        if (buildContext.startKeycloakOptions.realmJsonFilePath !== undefined) {
            assert(
                await existsAsync(buildContext.startKeycloakOptions.realmJsonFilePath),
                `${pathRelative(process.cwd(), buildContext.startKeycloakOptions.realmJsonFilePath)} does not exist`
            );
            return buildContext.startKeycloakOptions.realmJsonFilePath;
        }

        const internalFilePath = await (async () => {
            const defaultFilePath = getRealmJsonFilePath_defaultForKeycloakMajor(
                keycloakMajorVersionNumber
            );

            if (fs.existsSync(defaultFilePath)) {
                return defaultFilePath;
            }

            console.log(
                `${chalk.yellow(
                    `Keycloakify do not have a realm configuration for Keycloak ${keycloakMajorVersionNumber} yet.`
                )}`
            );

            console.log(chalk.cyan("Select what configuration to use:"));

            const dirPath = pathDirname(defaultFilePath);

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

    add_test_user_if_missing: {
        if (realmJsonFilePath === undefined) {
            break add_test_user_if_missing;
        }

        const realm: Record<string, unknown> = JSON.parse(
            fs.readFileSync(realmJsonFilePath).toString("utf8")
        );

        if (realm.users !== undefined) {
            break add_test_user_if_missing;
        }

        const realmJsonFilePath_internal = (() => {
            const filePath = getRealmJsonFilePath_defaultForKeycloakMajor(
                keycloakMajorVersionNumber
            );

            if (!fs.existsSync(filePath)) {
                return getRealmJsonFilePath_defaultForKeycloakMajor(25);
            }

            return filePath;
        })();

        const users = JSON.parse(
            fs.readFileSync(realmJsonFilePath_internal).toString("utf8")
        ).users;

        realm.users = users;

        fs.writeFileSync(realmJsonFilePath, JSON.stringify(realm, null, 2), "utf8");
    }

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

    const jarFilePath_cacheDir = pathJoin(
        buildContext.cacheDirPath,
        pathBasename(jarFilePath)
    );

    fs.copyFileSync(jarFilePath, jarFilePath_cacheDir);

    try {
        child_process.execSync(`docker rm --force ${CONTAINER_NAME}`, {
            stdio: "ignore"
        });
    } catch {}

    const DEFAULT_PORT = 8080;
    const port =
        cliCommandOptions.port ?? buildContext.startKeycloakOptions.port ?? DEFAULT_PORT;

    const SPACE_PLACEHOLDER = "SPACE_PLACEHOLDER_xKLmdPd";

    const dockerRunArgs: string[] = [
        `-p${SPACE_PLACEHOLDER}${port}:8080`,
        `--name${SPACE_PLACEHOLDER}${CONTAINER_NAME}`,
        `-e${SPACE_PLACEHOLDER}KEYCLOAK_ADMIN=admin`,
        `-e${SPACE_PLACEHOLDER}KEYCLOAK_ADMIN_PASSWORD=admin`,
        ...(buildContext.startKeycloakOptions.dockerExtraArgs.length === 0
            ? []
            : [
                  buildContext.startKeycloakOptions.dockerExtraArgs.join(
                      SPACE_PLACEHOLDER
                  )
              ]),
        ...(realmJsonFilePath === undefined
            ? []
            : [
                  `-v${SPACE_PLACEHOLDER}".${pathSep}${pathRelative(process.cwd(), realmJsonFilePath)}":/opt/keycloak/data/import/myrealm-realm.json`
              ]),
        `-v${SPACE_PLACEHOLDER}".${pathSep}${pathRelative(process.cwd(), jarFilePath_cacheDir)}":/opt/keycloak/providers/keycloak-theme.jar`,
        ...extensionJarFilePaths.map(
            jarFilePath =>
                `-v${SPACE_PLACEHOLDER}".${pathSep}${pathRelative(process.cwd(), jarFilePath)}":/opt/keycloak/providers/${pathBasename(jarFilePath)}`
        ),
        ...(keycloakMajorVersionNumber <= 20
            ? [`-e${SPACE_PLACEHOLDER}JAVA_OPTS=-Dkeycloak.profile=preview`]
            : []),
        ...[
            ...buildContext.themeNames,
            ...(fs.existsSync(
                pathJoin(
                    buildContext.keycloakifyBuildDirPath,
                    "theme",
                    ACCOUNT_V1_THEME_NAME
                )
            )
                ? [ACCOUNT_V1_THEME_NAME]
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
            .map(
                ({ localDirPath, containerDirPath }) =>
                    `-v${SPACE_PLACEHOLDER}".${pathSep}${pathRelative(process.cwd(), localDirPath)}":${containerDirPath}:rw`
            ),
        ...buildContext.environmentVariables
            .map(({ name }) => ({ name, envValue: process.env[name] }))
            .map(({ name, envValue }) =>
                envValue === undefined ? undefined : { name, envValue }
            )
            .filter(exclude(undefined))
            .map(
                ({ name, envValue }) =>
                    `--env${SPACE_PLACEHOLDER}${name}='${envValue.replace(/'/g, "'\\''")}'`
            ),
        `${buildContext.startKeycloakOptions.dockerImage?.reference ?? "quay.io/keycloak/keycloak"}:${dockerImageTag}`,
        "start-dev",
        ...(21 <= keycloakMajorVersionNumber && keycloakMajorVersionNumber < 24
            ? ["--features=declarative-user-profile"]
            : []),
        ...(realmJsonFilePath === undefined ? [] : ["--import-realm"]),
        ...(buildContext.startKeycloakOptions.keycloakExtraArgs.length === 0
            ? []
            : [
                  buildContext.startKeycloakOptions.keycloakExtraArgs.join(
                      SPACE_PLACEHOLDER
                  )
              ])
    ];

    console.log(
        chalk.blue(
            [
                `$ docker run \\`,
                ...dockerRunArgs
                    .map(arg => arg.replace(new RegExp(SPACE_PLACEHOLDER, "g"), " "))
                    .map(
                        (line, i, arr) =>
                            `    ${line}${arr.length - 1 === i ? "" : " \\"}`
                    )
            ].join("\n")
        )
    );

    const child = child_process.spawn(
        "docker",
        ["run", ...dockerRunArgs.map(line => line.split(SPACE_PLACEHOLDER)).flat()],
        { shell: true }
    );

    child.stdout.on("data", data => process.stdout.write(data));

    child.stderr.on("data", data => process.stderr.write(data));

    child.on("exit", process.exit);

    const srcDirPath = pathJoin(buildContext.projectDirPath, "src");

    {
        const kcHttpRelativePath = (() => {
            const match = buildContext.startKeycloakOptions.dockerExtraArgs
                .join(" ")
                .match(/KC_HTTP_RELATIVE_PATH=([^ ]+)/);

            if (match === null) {
                return undefined;
            }

            return match[1];
        })();

        const handler = async (data: Buffer) => {
            if (!data.toString("utf8").includes("Listening on: http://0.0.0.0:8080")) {
                return;
            }

            child.stdout.off("data", handler);

            await new Promise(resolve => setTimeout(resolve, 1_000));

            console.log(
                [
                    "",
                    `The ftl files from ${chalk.bold(
                        `.${pathSep}${pathRelative(process.cwd(), pathJoin(buildContext.keycloakifyBuildDirPath, "theme"))}`
                    )} are mounted in the Keycloak container.`,
                    "",
                    `Keycloak Admin console: ${chalk.cyan.bold(
                        `http://localhost:${port}${kcHttpRelativePath ?? ""}`
                    )}`,
                    `- user:     ${chalk.cyan.bold("admin")}`,
                    `- password: ${chalk.cyan.bold("admin")}`,
                    "",
                    "",
                    `${chalk.green("Your theme is accessible at:")}`,
                    `${chalk.green("➜")} ${chalk.cyan.bold(
                        (() => {
                            const url = new URL("https://my-theme.keycloakify.dev");

                            if (port !== DEFAULT_PORT) {
                                url.searchParams.set("port", `${port}`);
                            }
                            if (kcHttpRelativePath !== undefined) {
                                url.searchParams.set(
                                    "kcHttpRelativePath",
                                    kcHttpRelativePath
                                );
                            }

                            return url.href;
                        })()
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
                buildForKeycloakMajorVersionNumber: keycloakMajorVersionNumber,
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
