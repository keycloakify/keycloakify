import type { BuildContext } from "../shared/buildContext";
import { exclude } from "tsafe/exclude";
import {
    CONTAINER_NAME,
    KEYCLOAKIFY_SPA_DEV_SERVER_PORT,
    KEYCLOAKIFY_LOGIN_JAR_BASENAME,
    TEST_APP_URL
} from "../shared/constants";
import { SemVer } from "../tools/SemVer";
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
import { downloadAndExtractArchive } from "../tools/downloadAndExtractArchive";
import { startViteDevServer } from "./startViteDevServer";
import { getSupportedKeycloakMajorVersions } from "./realmConfig/defaultConfig";
import { getSupportedDockerImageTags } from "./getSupportedDockerImageTags";
import { getRealmConfig } from "./realmConfig";

export async function command(params: {
    buildContext: BuildContext;
    cliCommandOptions: {
        port: number | undefined;
        keycloakVersion: string | undefined;
        realmJsonFilePath: string | undefined;
    };
}) {
    exit_if_docker_not_installed: {
        let commandOutput: string | undefined = undefined;

        try {
            commandOutput = child_process
                .execSync("docker --version", {
                    stdio: ["ignore", "pipe", "ignore"]
                })
                ?.toString("utf8");
        } catch {}

        if (commandOutput?.includes("Docker") || commandOutput?.includes("podman")) {
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

    const { cliCommandOptions, buildContext } = params;

    const { allSupportedTags, latestMajorTags } = await getSupportedDockerImageTags({
        buildContext
    });

    const { dockerImageTag } = await (async () => {
        if (cliCommandOptions.keycloakVersion !== undefined) {
            const cliCommandOptions_keycloakVersion = cliCommandOptions.keycloakVersion;

            const tag = allSupportedTags.find(tag =>
                tag.startsWith(cliCommandOptions_keycloakVersion)
            );

            if (tag === undefined) {
                console.log(
                    chalk.red(
                        [
                            `We could not find a Keycloak Docker image for ${cliCommandOptions_keycloakVersion}`,
                            `Example of valid values: --keycloak-version 26, --keycloak-version 26.0.7`
                        ].join("\n")
                    )
                );

                process.exit(1);
            }

            return { dockerImageTag: tag };
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
                    "You can also explicitly provide the version with `npx keycloakify start-keycloak --keycloak-version 26` (or any other version)"
                )
            ].join("\n")
        );

        const tag_userSelected = await (async () => {
            let tag: string;

            let latestMajorTags_copy = [...latestMajorTags];

            while (true) {
                const { value } = await cliSelect<string>({
                    values: latestMajorTags_copy
                }).catch(() => {
                    process.exit(-1);
                });

                tag = value;

                {
                    const doImplementAccountMpa =
                        buildContext.implementedThemeTypes.account.isImplemented &&
                        buildContext.implementedThemeTypes.account.type === "Multi-Page";

                    if (doImplementAccountMpa && tag.startsWith("22.")) {
                        console.log(
                            chalk.yellow(
                                `You are implementing a Multi-Page Account theme. Keycloak 22 is not supported, select another version`
                            )
                        );
                        latestMajorTags_copy = latestMajorTags_copy.filter(
                            tag => !tag.startsWith("22.")
                        );
                        continue;
                    }
                }

                const readMajor = (tag: string) => {
                    const major = parseInt(tag.split(".")[0]);
                    assert(!isNaN(major));
                    return major;
                };

                {
                    const major = readMajor(tag);

                    const doImplementAdminTheme =
                        buildContext.implementedThemeTypes.admin.isImplemented;

                    const getIsSupported = (major: number) => major >= 23;

                    if (doImplementAdminTheme && !getIsSupported(major)) {
                        console.log(
                            chalk.yellow(
                                `You are implementing an Admin theme. Only Keycloak 23 and later are supported, select another version`
                            )
                        );
                        latestMajorTags_copy = latestMajorTags_copy.filter(tag =>
                            getIsSupported(readMajor(tag))
                        );
                        continue;
                    }
                }

                {
                    const doImplementAccountSpa =
                        buildContext.implementedThemeTypes.account.isImplemented &&
                        buildContext.implementedThemeTypes.account.type === "Single-Page";

                    const major = readMajor(tag);

                    const getIsSupported = (major: number) => major >= 19;

                    if (doImplementAccountSpa && !getIsSupported(major)) {
                        console.log(
                            chalk.yellow(
                                `You are implementing a Single-Page Account theme. Only Keycloak 19 and later are supported, select another version`
                            )
                        );
                        latestMajorTags_copy = latestMajorTags_copy.filter(tag =>
                            getIsSupported(readMajor(tag))
                        );
                        continue;
                    }
                }

                break;
            }

            return tag;
        })();

        console.log(`→ ${tag_userSelected}`);

        return { dockerImageTag: tag_userSelected };
    })();

    const keycloakMajorVersionNumber = (() => {
        const [wrap] = getSupportedKeycloakMajorVersions()
            .map(majorVersionNumber => ({
                majorVersionNumber,
                index: dockerImageTag.indexOf(`${majorVersionNumber}`)
            }))
            .filter(({ index }) => index !== -1)
            .sort((a, b) => a.index - b.index);

        if (wrap === undefined) {
            try {
                const version = SemVer.parse(dockerImageTag);

                console.error(
                    chalk.yellow(
                        `Keycloak version ${version.major} is not supported, supported versions are ${getSupportedKeycloakMajorVersions().join(", ")}`
                    )
                );

                process.exit(1);
            } catch {
                // NOTE: Latest version
                const [n] = getSupportedKeycloakMajorVersions();

                console.warn(
                    chalk.yellow(
                        `Could not determine the major Keycloak version number from the docker image tag ${dockerImageTag}. Assuming ${n}`
                    )
                );
                return n;
            }
        }

        return wrap.majorVersionNumber;
    })();

    const { clientName, onRealmConfigChange, realmJsonFilePath, realmName, username } =
        await getRealmConfig({
            keycloakMajorVersionNumber,
            realmJsonFilePath_userProvided: await (async () => {
                if (cliCommandOptions.realmJsonFilePath !== undefined) {
                    return getAbsoluteAndInOsFormatPath({
                        pathIsh: cliCommandOptions.realmJsonFilePath,
                        cwd: process.cwd()
                    });
                }

                if (buildContext.startKeycloakOptions.realmJsonFilePath !== undefined) {
                    assert(
                        await existsAsync(
                            buildContext.startKeycloakOptions.realmJsonFilePath
                        ),
                        `${pathRelative(process.cwd(), buildContext.startKeycloakOptions.realmJsonFilePath)} does not exist`
                    );
                    return buildContext.startKeycloakOptions.realmJsonFilePath;
                }

                return undefined;
            })(),
            buildContext
        });

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

    const extensionJarFilePaths = [
        ...(keycloakMajorVersionNumber <= 20
            ? (console.log(
                  chalk.yellow(
                      "WARNING: With older version of keycloak your changes to the realm configuration are not persisted"
                  )
              ),
              [])
            : [
                  pathJoin(
                      getThisCodebaseRootDirPath(),
                      "src",
                      "bin",
                      "start-keycloak",
                      KEYCLOAKIFY_LOGIN_JAR_BASENAME
                  )
              ]),
        ...(await Promise.all(
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
        ))
    ];

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

    const port = cliCommandOptions.port ?? buildContext.startKeycloakOptions.port ?? 8080;

    const doStartDevServer = (() => {
        const hasSpaUi =
            buildContext.implementedThemeTypes.admin.isImplemented ||
            (buildContext.implementedThemeTypes.account.isImplemented &&
                buildContext.implementedThemeTypes.account.type === "Single-Page");

        if (!hasSpaUi) {
            return false;
        }

        if (buildContext.bundler !== "vite") {
            console.log(
                chalk.yellow(
                    [
                        `WARNING: Since you are using ${buildContext.bundler} instead of Vite,`,
                        `you'll have to wait serval seconds for the changes you made on your account or admin theme to be reflected in the browser.\n`,
                        `For a better development experience, consider migrating to Vite.`
                    ].join(" ")
                )
            );

            return false;
        }

        if (keycloakMajorVersionNumber < 25) {
            console.log(
                chalk.yellow(
                    [
                        `WARNING: Your account or admin theme can't be tested with hot module replacement on Keycloak ${keycloakMajorVersionNumber}.`,
                        `This mean that you'll have to wait serval seconds for the changes to be reflected in the browser.`,
                        `For a better development experience, select a more recent version of Keycloak.`
                    ].join("\n")
                )
            );

            return false;
        }

        return true;
    })();

    let devServerPort: number | undefined = undefined;

    if (doStartDevServer) {
        const { port } = await startViteDevServer({ buildContext });

        devServerPort = port;
    }

    const SPACE_PLACEHOLDER = "SPACE_PLACEHOLDER_xKLmdPd";

    const dockerRunArgs: string[] = [
        `-p${SPACE_PLACEHOLDER}${port}:8080`,
        `--name${SPACE_PLACEHOLDER}${CONTAINER_NAME}`,
        ...(keycloakMajorVersionNumber >= 26
            ? [
                  `-e${SPACE_PLACEHOLDER}KC_BOOTSTRAP_ADMIN_USERNAME=admin`,
                  `-e${SPACE_PLACEHOLDER}KC_BOOTSTRAP_ADMIN_PASSWORD=admin`
              ]
            : [
                  `-e${SPACE_PLACEHOLDER}KEYCLOAK_ADMIN=admin`,
                  `-e${SPACE_PLACEHOLDER}KEYCLOAK_ADMIN_PASSWORD=admin`
              ]),
        ...(devServerPort === undefined
            ? []
            : [
                  `-e${SPACE_PLACEHOLDER}${KEYCLOAKIFY_SPA_DEV_SERVER_PORT}=${devServerPort}`
              ]),
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
                  `-v${SPACE_PLACEHOLDER}"${realmJsonFilePath}":/opt/keycloak/data/import/${realmName}-realm.json`
              ]),
        `-v${SPACE_PLACEHOLDER}"${jarFilePath_cacheDir}":/opt/keycloak/providers/keycloak-theme.jar`,
        ...extensionJarFilePaths.map(
            jarFilePath =>
                `-v${SPACE_PLACEHOLDER}"${jarFilePath}":/opt/keycloak/providers/${pathBasename(jarFilePath)}`
        ),
        ...(keycloakMajorVersionNumber <= 20
            ? [`-e${SPACE_PLACEHOLDER}JAVA_OPTS=-Dkeycloak.profile=preview`]
            : []),
        ...[
            ...buildContext.themeNames,
            ...(fs.existsSync(
                pathJoin(buildContext.keycloakifyBuildDirPath, "theme", "account-v1")
            )
                ? ["account-v1"]
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
                    `-v${SPACE_PLACEHOLDER}"${localDirPath}":${containerDirPath}:rw`
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

    child.stdout.on("data", async data => {
        if (data.toString("utf8").includes("keycloakify-logging: REALM_CONFIG_CHANGED")) {
            await onRealmConfigChange();
            return;
        }

        process.stdout.write(data);
    });

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
                            const url = new URL(TEST_APP_URL);

                            if (port !== 8080) {
                                url.searchParams.set("port", `${port}`);
                            }
                            if (kcHttpRelativePath !== undefined) {
                                url.searchParams.set(
                                    "kcHttpRelativePath",
                                    kcHttpRelativePath
                                );
                            }
                            if (realmName !== "myrealm") {
                                url.searchParams.set("realm", realmName);
                            }

                            if (clientName !== "myclient") {
                                url.searchParams.set("client", clientName);
                            }

                            return url.href;
                        })()
                    )}`,
                    "",
                    "You can login with the following credentials:",
                    `- username: ${chalk.cyan.bold(username)}`,
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
                ignore_path_covered_by_hmr: {
                    if (filePath.endsWith(".properties")) {
                        break ignore_path_covered_by_hmr;
                    }

                    if (!doStartDevServer) {
                        break ignore_path_covered_by_hmr;
                    }

                    ignore_account_spa: {
                        const doImplementAccountSpa =
                            buildContext.implementedThemeTypes.account.isImplemented &&
                            buildContext.implementedThemeTypes.account.type ===
                                "Single-Page";

                        if (!doImplementAccountSpa) {
                            break ignore_account_spa;
                        }

                        if (
                            !isInside({
                                dirPath: pathJoin(
                                    buildContext.themeSrcDirPath,
                                    "account"
                                ),
                                filePath
                            })
                        ) {
                            break ignore_account_spa;
                        }

                        return;
                    }

                    ignore_admin: {
                        if (!buildContext.implementedThemeTypes.admin.isImplemented) {
                            break ignore_admin;
                        }

                        if (
                            !isInside({
                                dirPath: pathJoin(buildContext.themeSrcDirPath, "admin"),
                                filePath
                            })
                        ) {
                            break ignore_admin;
                        }

                        return;
                    }
                }

                console.log(`Detected changes in ${filePath}`);

                await waitForDebounce();

                runFullBuild();
            });
    }
}
