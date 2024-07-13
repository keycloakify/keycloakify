import { parse as urlParse } from "url";
import {
    join as pathJoin,
    sep as pathSep,
    relative as pathRelative,
    resolve as pathResolve,
    dirname as pathDirname
} from "path";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";
import type { CliCommandOptions } from "../main";
import { z } from "zod";
import * as fs from "fs";
import { assert, type Equals } from "tsafe/assert";
import * as child_process from "child_process";
import {
    VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES,
    BUILD_FOR_KEYCLOAK_MAJOR_VERSION_ENV_NAME
} from "./constants";
import type { KeycloakVersionRange } from "./KeycloakVersionRange";
import { exclude } from "tsafe";
import { crawl } from "../tools/crawl";
import { THEME_TYPES } from "./constants";
import { objectFromEntries } from "tsafe/objectFromEntries";
import { objectEntries } from "tsafe/objectEntries";
import { type ThemeType } from "./constants";
import { id } from "tsafe/id";
import { symToStr } from "tsafe/symToStr";
import chalk from "chalk";
import { getProxyFetchOptions, type ProxyFetchOptions } from "../tools/fetchProxyOptions";

export type BuildContext = {
    themeVersion: string;
    themeNames: [string, ...string[]];
    extraThemeProperties: string[] | undefined;
    groupId: string;
    artifactId: string;
    loginThemeResourcesFromKeycloakVersion: string;
    projectDirPath: string;
    projectBuildDirPath: string;
    /** Directory that keycloakify outputs to. Defaults to {cwd}/build_keycloak */
    keycloakifyBuildDirPath: string;
    publicDirPath: string;
    cacheDirPath: string;
    /** If your app is hosted under a subpath, it's the case in CRA if you have "homepage": "https://example.com/my-app" in your package.json
     * In this case the urlPathname will be "/my-app/" */
    urlPathname: string | undefined;
    assetsDirPath: string;
    fetchOptions: ProxyFetchOptions;
    kcContextExclusionsFtlCode: string | undefined;
    environmentVariables: { name: string; default: string }[];
    themeSrcDirPath: string;
    recordIsImplementedByThemeType: Readonly<Record<ThemeType | "email", boolean>>;
    jarTargets: {
        keycloakVersionRange: KeycloakVersionRange;
        jarFileBasename: string;
    }[];
    bundler:
        | {
              type: "vite";
          }
        | {
              type: "webpack";
              packageJsonDirPath: string;
              packageJsonScripts: Record<string, string>;
          };
    doUseAccountV3: boolean;
};

export type BuildOptions = {
    themeName?: string | string[];
    themeVersion?: string;
    environmentVariables?: { name: string; default: string }[];
    extraThemeProperties?: string[];
    artifactId?: string;
    groupId?: string;
    loginThemeResourcesFromKeycloakVersion?: string;
    keycloakifyBuildDirPath?: string;
    kcContextExclusionsFtl?: string;
    /** https://docs.keycloakify.dev/v/v10/targetting-specific-keycloak-versions */
    keycloakVersionTargets?: BuildOptions.KeycloakVersionTargets;
    doUseAccountV3?: boolean;
};

export namespace BuildOptions {
    export type KeycloakVersionTargets =
        | ({ hasAccountTheme: true } & Record<
              KeycloakVersionRange.WithAccountV1Theme,
              string | boolean
          >)
        | ({ hasAccountTheme: false } & Record<
              KeycloakVersionRange.WithoutAccountV1Theme,
              string | boolean
          >);
}

export type ResolvedViteConfig = {
    buildDir: string;
    publicDir: string;
    assetsDir: string;
    urlPathname: string | undefined;
    buildOptions: BuildOptions;
};

export function getBuildContext(params: {
    cliCommandOptions: CliCommandOptions;
}): BuildContext {
    const { cliCommandOptions } = params;

    const projectDirPath =
        cliCommandOptions.projectDirPath !== undefined
            ? getAbsoluteAndInOsFormatPath({
                  pathIsh: cliCommandOptions.projectDirPath,
                  cwd: process.cwd()
              })
            : process.cwd();

    const { themeSrcDirPath } = (() => {
        const srcDirPath = pathJoin(projectDirPath, "src");

        const themeSrcDirPath: string | undefined = crawl({
            dirPath: srcDirPath,
            returnedPathsType: "relative to dirPath"
        })
            .map(fileRelativePath => {
                for (const themeSrcDirBasename of ["keycloak-theme", "keycloak_theme"]) {
                    const split = fileRelativePath.split(themeSrcDirBasename);
                    if (split.length === 2) {
                        return pathJoin(srcDirPath, split[0] + themeSrcDirBasename);
                    }
                }
                return undefined;
            })
            .filter(exclude(undefined))[0];

        if (themeSrcDirPath !== undefined) {
            return { themeSrcDirPath };
        }

        for (const themeType of [...THEME_TYPES, "email"]) {
            if (!fs.existsSync(pathJoin(srcDirPath, themeType))) {
                continue;
            }
            return { themeSrcDirPath: srcDirPath };
        }

        console.log(
            chalk.red(
                [
                    `Can't locate your Keycloak theme source directory in .${pathSep}${pathRelative(process.cwd(), srcDirPath)}`,
                    `Make sure to either use the Keycloakify CLI in the root of your Keycloakify project or use the --project CLI option`,
                    `If you are collocating your Keycloak theme with your app you must have a directory named 'keycloak-theme' or 'keycloak_theme' in your 'src' directory`
                ].join("\n")
            )
        );

        process.exit(1);
    })();

    const { resolvedViteConfig } = (() => {
        if (
            fs
                .readdirSync(projectDirPath)
                .find(fileBasename => fileBasename.startsWith("vite.config")) ===
            undefined
        ) {
            return { resolvedViteConfig: undefined };
        }

        const output = child_process
            .execSync("npx vite", {
                cwd: projectDirPath,
                env: {
                    ...process.env,
                    [VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.RESOLVE_VITE_CONFIG]: "true"
                }
            })
            .toString("utf8");

        assert(
            output.includes(VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.RESOLVE_VITE_CONFIG),
            "Seems like the Keycloakify's Vite plugin is not installed."
        );

        const resolvedViteConfigStr = output
            .split(VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.RESOLVE_VITE_CONFIG)
            .reverse()[0];

        const resolvedViteConfig: ResolvedViteConfig = JSON.parse(resolvedViteConfigStr);

        return { resolvedViteConfig };
    })();

    const packageJsonFilePath = (function getPackageJSonDirPath(upCount: number): string {
        const dirPath = pathResolve(
            pathJoin(...[projectDirPath, ...Array(upCount).fill("..")])
        );

        assert(dirPath !== pathSep, "Root package.json not found");

        success: {
            const packageJsonFilePath = pathJoin(dirPath, "package.json");

            if (!fs.existsSync(packageJsonFilePath)) {
                break success;
            }

            const parsedPackageJson = z
                .object({
                    name: z.string().optional(),
                    dependencies: z.record(z.string()).optional(),
                    devDependencies: z.record(z.string()).optional()
                })
                .parse(JSON.parse(fs.readFileSync(packageJsonFilePath).toString("utf8")));

            if (
                parsedPackageJson.dependencies?.keycloakify === undefined &&
                parsedPackageJson.devDependencies?.keycloakify === undefined &&
                parsedPackageJson.name !== "keycloakify" // NOTE: For local storybook build
            ) {
                break success;
            }

            return packageJsonFilePath;
        }

        return getPackageJSonDirPath(upCount + 1);
    })(0);

    const parsedPackageJson = (() => {
        type BuildOptions_packageJson = BuildOptions & {
            projectBuildDirPath?: string;
            staticDirPathInProjectBuildDirPath?: string;
            publicDirPath?: string;
            doUseAccountV3?: boolean;
        };

        type ParsedPackageJson = {
            name?: string;
            version?: string;
            homepage?: string;
            keycloakify?: BuildOptions_packageJson;
        };

        const zParsedPackageJson = z.object({
            name: z.string().optional(),
            version: z.string().optional(),
            homepage: z.string().optional(),
            keycloakify: id<z.ZodType<BuildOptions_packageJson>>(
                (() => {
                    const zBuildOptions_packageJson = z.object({
                        extraThemeProperties: z.array(z.string()).optional(),
                        artifactId: z.string().optional(),
                        groupId: z.string().optional(),
                        loginThemeResourcesFromKeycloakVersion: z.string().optional(),
                        projectBuildDirPath: z.string().optional(),
                        keycloakifyBuildDirPath: z.string().optional(),
                        kcContextExclusionsFtl: z.string().optional(),
                        environmentVariables: z
                            .array(
                                z.object({
                                    name: z.string(),
                                    default: z.string()
                                })
                            )
                            .optional(),
                        themeName: z.union([z.string(), z.array(z.string())]).optional(),
                        themeVersion: z.string().optional(),
                        staticDirPathInProjectBuildDirPath: z.string().optional(),
                        publicDirPath: z.string().optional(),
                        keycloakVersionTargets: id<
                            z.ZodType<BuildOptions.KeycloakVersionTargets>
                        >(
                            (() => {
                                const zKeycloakVersionTargets = z.union([
                                    z.object({
                                        hasAccountTheme: z.literal(true),
                                        "21-and-below": z.union([
                                            z.boolean(),
                                            z.string()
                                        ]),
                                        "23": z.union([z.boolean(), z.string()]),
                                        "24": z.union([z.boolean(), z.string()]),
                                        "25-and-above": z.union([z.boolean(), z.string()])
                                    }),
                                    z.object({
                                        hasAccountTheme: z.literal(false),
                                        "21-and-below": z.union([
                                            z.boolean(),
                                            z.string()
                                        ]),
                                        "22-and-above": z.union([z.boolean(), z.string()])
                                    })
                                ]);

                                {
                                    type Got = z.infer<typeof zKeycloakVersionTargets>;
                                    type Expected = BuildOptions.KeycloakVersionTargets;
                                    assert<Equals<Got, Expected>>();
                                }

                                return zKeycloakVersionTargets;
                            })()
                        ).optional(),
                        doUseAccountV3: z.boolean().optional()
                    });

                    {
                        type Got = z.infer<typeof zBuildOptions_packageJson>;
                        type Expected = BuildOptions_packageJson;
                        assert<Equals<Got, Expected>>();
                    }

                    return zBuildOptions_packageJson;
                })()
            ).optional()
        });

        {
            type Got = z.infer<typeof zParsedPackageJson>;
            type Expected = ParsedPackageJson;
            assert<Equals<Got, Expected>>();
        }

        const configurationPackageJsonFilePath = (() => {
            const rootPackageJsonFilePath = pathJoin(projectDirPath, "package.json");

            return fs.existsSync(rootPackageJsonFilePath)
                ? rootPackageJsonFilePath
                : packageJsonFilePath;
        })();

        return zParsedPackageJson.parse(
            JSON.parse(fs.readFileSync(configurationPackageJsonFilePath).toString("utf8"))
        );
    })();

    const buildOptions = {
        ...parsedPackageJson.keycloakify,
        ...resolvedViteConfig?.buildOptions
    };

    const recordIsImplementedByThemeType = objectFromEntries(
        (["login", "account", "email"] as const).map(themeType => [
            themeType,
            fs.existsSync(pathJoin(themeSrcDirPath, themeType))
        ])
    );

    const themeNames = ((): [string, ...string[]] => {
        if (buildOptions.themeName === undefined) {
            return parsedPackageJson.name === undefined
                ? ["keycloakify"]
                : [
                      parsedPackageJson.name
                          .replace(/^@(.*)/, "$1")
                          .split("/")
                          .join("-")
                  ];
        }

        if (typeof buildOptions.themeName === "string") {
            return [buildOptions.themeName];
        }

        const [mainThemeName, ...themeVariantNames] = buildOptions.themeName;

        assert(mainThemeName !== undefined);

        return [mainThemeName, ...themeVariantNames];
    })();

    const projectBuildDirPath = (() => {
        webpack: {
            if (resolvedViteConfig !== undefined) {
                break webpack;
            }

            if (buildOptions.projectBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    pathIsh: buildOptions.projectBuildDirPath,
                    cwd: projectDirPath
                });
            }

            return pathJoin(projectDirPath, "build");
        }

        return pathJoin(projectDirPath, resolvedViteConfig.buildDir);
    })();

    const bundler = resolvedViteConfig !== undefined ? "vite" : "webpack";

    const doUseAccountV3 = buildOptions.doUseAccountV3 ?? false;

    return {
        bundler:
            resolvedViteConfig !== undefined
                ? { type: "vite" }
                : (() => {
                      const { scripts } = z
                          .object({
                              scripts: z.record(z.string()).optional()
                          })
                          .parse(
                              JSON.parse(
                                  fs.readFileSync(packageJsonFilePath).toString("utf8")
                              )
                          );

                      return {
                          type: "webpack",
                          packageJsonDirPath: pathDirname(packageJsonFilePath),
                          packageJsonScripts: scripts ?? {}
                      };
                  })(),
        themeVersion: buildOptions.themeVersion ?? parsedPackageJson.version ?? "0.0.0",
        themeNames,
        extraThemeProperties: buildOptions.extraThemeProperties,
        groupId: (() => {
            const fallbackGroupId = `${themeNames[0]}.keycloak`;

            return (
                process.env.KEYCLOAKIFY_GROUP_ID ??
                buildOptions.groupId ??
                (parsedPackageJson.homepage === undefined
                    ? fallbackGroupId
                    : urlParse(parsedPackageJson.homepage)
                          .host?.replace(/:[0-9]+$/, "")
                          ?.split(".")
                          .reverse()
                          .join(".") ?? fallbackGroupId) + ".keycloak"
            );
        })(),
        artifactId:
            process.env.KEYCLOAKIFY_ARTIFACT_ID ??
            buildOptions.artifactId ??
            `${themeNames[0]}-keycloak-theme`,
        loginThemeResourcesFromKeycloakVersion:
            buildOptions.loginThemeResourcesFromKeycloakVersion ?? "24.0.4",
        projectDirPath,
        projectBuildDirPath,
        keycloakifyBuildDirPath: (() => {
            if (buildOptions.keycloakifyBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    pathIsh: buildOptions.keycloakifyBuildDirPath,
                    cwd: projectDirPath
                });
            }

            return pathJoin(
                projectDirPath,
                resolvedViteConfig?.buildDir === undefined
                    ? "build_keycloak"
                    : `${resolvedViteConfig.buildDir}_keycloak`
            );
        })(),
        publicDirPath: (() => {
            if (process.env.PUBLIC_DIR_PATH !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    pathIsh: process.env.PUBLIC_DIR_PATH,
                    cwd: projectDirPath
                });
            }

            webpack: {
                if (resolvedViteConfig !== undefined) {
                    break webpack;
                }

                if (buildOptions.publicDirPath !== undefined) {
                    return getAbsoluteAndInOsFormatPath({
                        pathIsh: buildOptions.publicDirPath,
                        cwd: projectDirPath
                    });
                }

                return pathJoin(projectDirPath, "public");
            }

            return pathJoin(projectDirPath, resolvedViteConfig.publicDir);
        })(),
        cacheDirPath: (() => {
            const cacheDirPath = pathJoin(
                (() => {
                    if (process.env.XDG_CACHE_HOME !== undefined) {
                        return getAbsoluteAndInOsFormatPath({
                            pathIsh: process.env.XDG_CACHE_HOME,
                            cwd: process.cwd()
                        });
                    }

                    return pathJoin(
                        pathDirname(packageJsonFilePath),
                        "node_modules",
                        ".cache"
                    );
                })(),
                "keycloakify"
            );

            return cacheDirPath;
        })(),
        urlPathname: (() => {
            webpack: {
                if (resolvedViteConfig !== undefined) {
                    break webpack;
                }

                const { homepage } = parsedPackageJson;

                let url: URL | undefined = undefined;

                if (homepage !== undefined) {
                    url = new URL(homepage);
                }

                if (url === undefined) {
                    return undefined;
                }

                const out = url.pathname.replace(/([^/])$/, "$1/");
                return out === "/" ? undefined : out;
            }

            return resolvedViteConfig.urlPathname;
        })(),
        assetsDirPath: (() => {
            webpack: {
                if (resolvedViteConfig !== undefined) {
                    break webpack;
                }

                if (buildOptions.staticDirPathInProjectBuildDirPath !== undefined) {
                    getAbsoluteAndInOsFormatPath({
                        pathIsh: buildOptions.staticDirPathInProjectBuildDirPath,
                        cwd: projectBuildDirPath
                    });
                }

                return pathJoin(projectBuildDirPath, "static");
            }

            return pathJoin(projectBuildDirPath, resolvedViteConfig.assetsDir);
        })(),
        kcContextExclusionsFtlCode: (() => {
            if (buildOptions.kcContextExclusionsFtl === undefined) {
                return undefined;
            }

            if (buildOptions.kcContextExclusionsFtl.endsWith(".ftl")) {
                const kcContextExclusionsFtlPath = getAbsoluteAndInOsFormatPath({
                    pathIsh: buildOptions.kcContextExclusionsFtl,
                    cwd: projectDirPath
                });

                return fs.readFileSync(kcContextExclusionsFtlPath).toString("utf8");
            }

            return buildOptions.kcContextExclusionsFtl;
        })(),
        environmentVariables: buildOptions.environmentVariables ?? [],
        recordIsImplementedByThemeType,
        themeSrcDirPath,
        fetchOptions: getProxyFetchOptions({
            npmConfigGetCwd: (function callee(upCount: number): string {
                const dirPath = pathResolve(
                    pathJoin(...[projectDirPath, ...Array(upCount).fill("..")])
                );

                assert(
                    dirPath !== pathSep,
                    "Couldn't find a place to run 'npm config get'"
                );

                try {
                    child_process.execSync("npm config get", {
                        cwd: dirPath,
                        stdio: "pipe"
                    });
                } catch (error) {
                    if (String(error).includes("ENOWORKSPACES")) {
                        return callee(upCount + 1);
                    }

                    throw error;
                }

                return dirPath;
            })(0)
        }),
        jarTargets: (() => {
            const getDefaultJarFileBasename = (range: string) =>
                `keycloak-theme-for-kc-${range}.jar`;

            build_for_specific_keycloak_major_version: {
                const buildForKeycloakMajorVersionNumber = (() => {
                    const envValue =
                        process.env[BUILD_FOR_KEYCLOAK_MAJOR_VERSION_ENV_NAME];

                    if (envValue === undefined) {
                        return undefined;
                    }

                    const major = parseInt(envValue);

                    assert(!isNaN(major));

                    return major;
                })();

                if (buildForKeycloakMajorVersionNumber === undefined) {
                    break build_for_specific_keycloak_major_version;
                }

                const keycloakVersionRange: KeycloakVersionRange = (() => {
                    const doesImplementAccountV1Theme =
                        !doUseAccountV3 && recordIsImplementedByThemeType.account;

                    if (doesImplementAccountV1Theme) {
                        const keycloakVersionRange = (() => {
                            if (buildForKeycloakMajorVersionNumber <= 21) {
                                return "21-and-below" as const;
                            }

                            assert(buildForKeycloakMajorVersionNumber !== 22);

                            if (buildForKeycloakMajorVersionNumber === 23) {
                                return "23" as const;
                            }

                            if (buildForKeycloakMajorVersionNumber === 24) {
                                return "24" as const;
                            }

                            return "25-and-above" as const;
                        })();

                        assert<
                            Equals<
                                typeof keycloakVersionRange,
                                KeycloakVersionRange.WithAccountV1Theme
                            >
                        >();

                        return keycloakVersionRange;
                    } else {
                        const keycloakVersionRange = (() => {
                            if (buildForKeycloakMajorVersionNumber <= 21) {
                                return "21-and-below" as const;
                            }

                            return "22-and-above" as const;
                        })();

                        assert<
                            Equals<
                                typeof keycloakVersionRange,
                                KeycloakVersionRange.WithoutAccountV1Theme
                            >
                        >();

                        return keycloakVersionRange;
                    }
                })();

                const jarFileBasename = (() => {
                    use_custom_jar_basename: {
                        const { keycloakVersionTargets } = buildOptions;

                        if (keycloakVersionTargets === undefined) {
                            break use_custom_jar_basename;
                        }

                        const entry = objectEntries(keycloakVersionTargets).find(
                            ([keycloakVersionRange_entry]) =>
                                keycloakVersionRange_entry === keycloakVersionRange
                        );

                        if (entry === undefined) {
                            break use_custom_jar_basename;
                        }

                        const maybeJarFileBasename = entry[1];

                        if (typeof maybeJarFileBasename !== "string") {
                            break use_custom_jar_basename;
                        }

                        return maybeJarFileBasename;
                    }

                    return getDefaultJarFileBasename(keycloakVersionRange);
                })();

                return [
                    {
                        keycloakVersionRange,
                        jarFileBasename
                    }
                ];
            }

            const jarTargets_default = (() => {
                const jarTargets: BuildContext["jarTargets"] = [];

                if (!doUseAccountV3 && recordIsImplementedByThemeType.account) {
                    for (const keycloakVersionRange of [
                        "21-and-below",
                        "23",
                        "24",
                        "25-and-above"
                    ] as const) {
                        assert<
                            Equals<
                                typeof keycloakVersionRange,
                                KeycloakVersionRange.WithAccountV1Theme
                            >
                        >(true);
                        jarTargets.push({
                            keycloakVersionRange,
                            jarFileBasename:
                                getDefaultJarFileBasename(keycloakVersionRange)
                        });
                    }
                } else {
                    for (const keycloakVersionRange of [
                        "21-and-below",
                        "22-and-above"
                    ] as const) {
                        assert<
                            Equals<
                                typeof keycloakVersionRange,
                                KeycloakVersionRange.WithoutAccountV1Theme
                            >
                        >(true);
                        jarTargets.push({
                            keycloakVersionRange,
                            jarFileBasename:
                                getDefaultJarFileBasename(keycloakVersionRange)
                        });
                    }
                }

                return jarTargets;
            })();

            if (buildOptions.keycloakVersionTargets === undefined) {
                return jarTargets_default;
            }

            if (
                buildOptions.keycloakVersionTargets.hasAccountTheme !== doUseAccountV3
                    ? false
                    : recordIsImplementedByThemeType.account
            ) {
                console.log(
                    chalk.red(
                        (() => {
                            const { keycloakVersionTargets } = buildOptions;

                            let message = `Bad ${symToStr({ keycloakVersionTargets })} configuration.\n`;

                            if (keycloakVersionTargets.hasAccountTheme) {
                                message +=
                                    "Your codebase does not seem to implement an account theme ";
                            } else {
                                message += "Your codebase implements an account theme ";
                            }

                            const { hasAccountTheme } = keycloakVersionTargets;

                            message += `but you have set ${symToStr({ keycloakVersionTargets })}.${symToStr({ hasAccountTheme })}`;
                            message += ` to ${hasAccountTheme} in your `;
                            message += (() => {
                                switch (bundler) {
                                    case "vite":
                                        return "vite.config.ts";
                                    case "webpack":
                                        return "package.json";
                                }
                                assert<Equals<typeof bundler, never>>(false);
                            })();
                            message += `. Please set it to ${!hasAccountTheme} `;
                            message +=
                                "and fill up the relevant keycloak version ranges.\n";
                            message += "Example:\n";
                            message += JSON.stringify(
                                id<Pick<BuildOptions, "keycloakVersionTargets">>({
                                    keycloakVersionTargets: {
                                        hasAccountTheme:
                                            recordIsImplementedByThemeType.account,
                                        ...objectFromEntries(
                                            jarTargets_default.map(
                                                ({
                                                    keycloakVersionRange,
                                                    jarFileBasename
                                                }) => [
                                                    keycloakVersionRange,
                                                    jarFileBasename
                                                ]
                                            )
                                        )
                                    }
                                }),
                                null,
                                2
                            );
                            message +=
                                "\nSee: https://docs.keycloakify.dev/v/v10/targetting-specific-keycloak-versions";

                            return message;
                        })()
                    )
                );

                process.exit(1);
            }

            const jarTargets: BuildContext["jarTargets"] = [];

            const { hasAccountTheme, ...rest } = buildOptions.keycloakVersionTargets;

            for (const [keycloakVersionRange, jarNameOrBoolean] of objectEntries(rest)) {
                if (jarNameOrBoolean === false) {
                    continue;
                }

                if (jarNameOrBoolean === true) {
                    jarTargets.push({
                        keycloakVersionRange: keycloakVersionRange,
                        jarFileBasename: getDefaultJarFileBasename(keycloakVersionRange)
                    });
                    continue;
                }

                const jarFileBasename = jarNameOrBoolean;

                if (!jarFileBasename.endsWith(".jar")) {
                    console.log(
                        chalk.red(`Bad ${jarFileBasename} should end with '.jar'\n`)
                    );
                    process.exit(1);
                }

                if (jarFileBasename.includes("/") || jarFileBasename.includes("\\")) {
                    console.log(
                        chalk.red(
                            [
                                `Invalid ${jarFileBasename}. It's not supposed to be a path,`,
                                `Only the basename of the jar file is expected.`,
                                `Example: keycloak-theme.jar`
                            ].join(" ")
                        )
                    );
                    process.exit(1);
                }

                jarTargets.push({
                    keycloakVersionRange: keycloakVersionRange,
                    jarFileBasename: jarNameOrBoolean
                });
            }

            if (jarTargets.length === 0) {
                console.log(
                    chalk.red(
                        "All jar targets are disabled. Please enable at least one jar target."
                    )
                );
                process.exit(1);
            }

            return jarTargets;
        })(),
        doUseAccountV3
    };
}
