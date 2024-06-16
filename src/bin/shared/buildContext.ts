import { parse as urlParse } from "url";
import { join as pathJoin } from "path";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";
import { getNpmWorkspaceRootDirPath } from "../tools/getNpmWorkspaceRootDirPath";
import type { CliCommandOptions } from "../main";
import { z } from "zod";
import * as fs from "fs";
import { assert, type Equals } from "tsafe/assert";
import * as child_process from "child_process";
import {
    vitePluginSubScriptEnvNames,
    buildForKeycloakMajorVersionEnvName
} from "./constants";
import type { KeycloakVersionRange } from "./KeycloakVersionRange";
import { exclude } from "tsafe";
import { crawl } from "../tools/crawl";
import { themeTypes } from "./constants";
import { objectFromEntries } from "tsafe/objectFromEntries";
import { objectEntries } from "tsafe/objectEntries";
import { type ThemeType } from "./constants";
import { id } from "tsafe/id";
import { symToStr } from "tsafe/symToStr";
import chalk from "chalk";

export type BuildContext = {
    bundler: "vite" | "webpack";
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
    npmWorkspaceRootDirPath: string;
    kcContextExclusionsFtlCode: string | undefined;
    environmentVariables: { name: string; default: string }[];
    themeSrcDirPath: string;
    recordIsImplementedByThemeType: Readonly<Record<ThemeType | "email", boolean>>;
    jarTargets: {
        keycloakVersionRange: KeycloakVersionRange;
        jarFileBasename: string;
    }[];
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
};

export namespace BuildOptions {
    export type KeycloakVersionTargets =
        | ({ hasAccountTheme: true } & Record<
              KeycloakVersionRange.WithAccountTheme,
              string | boolean
          >)
        | ({ hasAccountTheme: false } & Record<
              KeycloakVersionRange.WithoutAccountTheme,
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

    const projectDirPath = (() => {
        if (cliCommandOptions.projectDirPath === undefined) {
            return process.cwd();
        }

        return getAbsoluteAndInOsFormatPath({
            pathIsh: cliCommandOptions.projectDirPath,
            cwd: process.cwd()
        });
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
                    [vitePluginSubScriptEnvNames.resolveViteConfig]: "true"
                }
            })
            .toString("utf8");

        assert(
            output.includes(vitePluginSubScriptEnvNames.resolveViteConfig),
            "Seems like the Keycloakify's Vite plugin is not installed."
        );

        const resolvedViteConfigStr = output
            .split(vitePluginSubScriptEnvNames.resolveViteConfig)
            .reverse()[0];

        const resolvedViteConfig: ResolvedViteConfig = JSON.parse(resolvedViteConfigStr);

        return { resolvedViteConfig };
    })();

    const parsedPackageJson = (() => {
        type BuildOptions_packageJson = BuildOptions & {
            projectBuildDirPath?: string;
            staticDirPathInProjectBuildDirPath?: string;
            publicDirPath?: string;
        };

        type ParsedPackageJson = {
            name: string;
            version?: string;
            homepage?: string;
            keycloakify?: BuildOptions_packageJson;
        };

        const zParsedPackageJson = z.object({
            name: z.string(),
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
                        ).optional()
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

        return zParsedPackageJson.parse(
            JSON.parse(
                fs.readFileSync(pathJoin(projectDirPath, "package.json")).toString("utf8")
            )
        );
    })();

    const buildOptions = {
        ...parsedPackageJson.keycloakify,
        ...resolvedViteConfig?.buildOptions
    };

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

        for (const themeType of [...themeTypes, "email"]) {
            if (!fs.existsSync(pathJoin(srcDirPath, themeType))) {
                continue;
            }
            return { themeSrcDirPath: srcDirPath };
        }

        console.log(
            chalk.red(
                [
                    "Can't locate your keycloak theme source directory.",
                    "See: https://docs.keycloakify.dev/v/v10/keycloakify-in-my-app/collocation"
                ].join("\n")
            )
        );

        process.exit(1);
    })();

    const recordIsImplementedByThemeType = objectFromEntries(
        (["login", "account", "email"] as const).map(themeType => [
            themeType,
            fs.existsSync(pathJoin(themeSrcDirPath, themeType))
        ])
    );

    const themeNames = ((): [string, ...string[]] => {
        if (buildOptions.themeName === undefined) {
            return [
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

    const { npmWorkspaceRootDirPath } = getNpmWorkspaceRootDirPath({
        projectDirPath,
        dependencyExpected: "keycloakify"
    });

    const bundler = resolvedViteConfig !== undefined ? "vite" : "webpack";

    return {
        bundler,
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

                    return pathJoin(npmWorkspaceRootDirPath, "node_modules", ".cache");
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
        npmWorkspaceRootDirPath,
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
        jarTargets: (() => {
            const getDefaultJarFileBasename = (range: string) =>
                `keycloak-theme-for-kc-${range}.jar`;

            build_for_specific_keycloak_major_version: {
                const buildForKeycloakMajorVersionNumber = (() => {
                    const envValue = process.env[buildForKeycloakMajorVersionEnvName];

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
                    const doesImplementAccountTheme =
                        recordIsImplementedByThemeType.account;

                    if (doesImplementAccountTheme) {
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
                                KeycloakVersionRange.WithAccountTheme
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
                                KeycloakVersionRange.WithoutAccountTheme
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

                if (recordIsImplementedByThemeType.account) {
                    for (const keycloakVersionRange of [
                        "21-and-below",
                        "23",
                        "24",
                        "25-and-above"
                    ] as const) {
                        assert<
                            Equals<
                                typeof keycloakVersionRange,
                                KeycloakVersionRange.WithAccountTheme
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
                                KeycloakVersionRange.WithoutAccountTheme
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
                buildOptions.keycloakVersionTargets.hasAccountTheme !==
                recordIsImplementedByThemeType.account
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
        })()
    };
}
