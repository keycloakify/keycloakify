import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";
import * as child_process from "child_process";
import chalk from "chalk";
import { z } from "zod";
import { assert, type Equals, is } from "tsafe/assert";
import { id } from "tsafe/id";
import { objectKeys } from "tsafe/objectKeys";
import { getAbsoluteAndInOsFormatPath } from "./getAbsoluteAndInOsFormatPath";
import { exclude } from "tsafe/exclude";
import { rmSync } from "./fs.rmSync";
import { Deferred } from "evt/tools/Deferred";

export async function npmInstall(params: { packageJsonDirPath: string }) {
    const { packageJsonDirPath } = params;

    const packageManagerBinName = (() => {
        const packageMangers = [
            {
                binName: "yarn",
                lockFileBasenames: ["yarn.lock"]
            },
            {
                binName: "npm",
                lockFileBasenames: ["package-lock.json"]
            },
            {
                binName: "pnpm",
                lockFileBasenames: ["pnpm-lock.yaml"]
            },
            {
                binName: "bun",
                lockFileBasenames: ["bun.lockdb", "bun.lockb", "bun.lock"]
            },
            {
                binName: "deno",
                lockFileBasenames: ["deno.lock"]
            }
        ] as const;

        for (const { binName, lockFileBasenames } of packageMangers) {
            for (const lockFileBasename of lockFileBasenames) {
                if (
                    fs.existsSync(pathJoin(packageJsonDirPath, lockFileBasename)) ||
                    fs.existsSync(pathJoin(process.cwd(), lockFileBasename))
                ) {
                    return binName;
                }
            }
        }

        throw new Error(
            "No lock file found, cannot tell which package manager to use for installing dependencies."
        );
    })();

    console.log(`Installing the new dependencies...`);

    install_without_breaking_links: {
        if (packageManagerBinName !== "yarn") {
            break install_without_breaking_links;
        }

        const garronejLinkInfos = getGarronejLinkInfos({ packageJsonDirPath });

        if (garronejLinkInfos === undefined) {
            break install_without_breaking_links;
        }

        console.log(chalk.green("Installing in a way that won't break the links..."));

        await installWithoutBreakingLinks({
            packageJsonDirPath,
            garronejLinkInfos
        });

        return;
    }

    try {
        await runPackageManagerInstall({
            packageManagerBinName,
            cwd: packageJsonDirPath
        });
    } catch {
        console.log(
            chalk.yellow(
                `\`${packageManagerBinName} install\` failed, continuing anyway...`
            )
        );
    }
}

async function runPackageManagerInstall(params: {
    packageManagerBinName: string;
    cwd: string;
}) {
    const { packageManagerBinName, cwd } = params;

    const dCompleted = new Deferred<void>();

    const child = child_process.spawn(
        packageManagerBinName,
        ["install", ...(packageManagerBinName !== "npm" ? [] : ["--force"])],
        {
            cwd,
            env: process.env,
            shell: true
        }
    );

    child.stdout.on("data", data => process.stdout.write(data));

    let errorLog = "";

    child.stderr.on("data", data => {
        if (data.toString("utf8").includes("peer dependency")) {
            return;
        }

        errorLog += data.toString("utf8");
    });

    child.on("exit", code => {
        if (code !== 0) {
            console.log(errorLog);
            dCompleted.reject(new Error(`Failed with code ${code}`));
            return;
        }

        dCompleted.resolve();
    });

    await dCompleted.pr;
}

function getGarronejLinkInfos(params: {
    packageJsonDirPath: string;
}): { linkedModuleNames: string[]; yarnHomeDirPath: string } | undefined {
    const { packageJsonDirPath } = params;

    const nodeModuleDirPath = pathJoin(packageJsonDirPath, "node_modules");

    if (!fs.existsSync(nodeModuleDirPath)) {
        return undefined;
    }

    const linkedModuleNames: string[] = [];

    let yarnHomeDirPath: string | undefined = undefined;

    const getIsLinkedByGarronejScript = (path: string) => {
        let realPath: string;

        try {
            realPath = fs.readlinkSync(path);
        } catch {
            return false;
        }

        const doesIncludeYarnHome = realPath.includes(".yarn_home");

        if (!doesIncludeYarnHome) {
            return false;
        }

        set_yarnHomeDirPath: {
            if (yarnHomeDirPath !== undefined) {
                break set_yarnHomeDirPath;
            }

            const [firstElement] = getAbsoluteAndInOsFormatPath({
                pathIsh: realPath,
                cwd: pathDirname(path)
            }).split(".yarn_home");

            yarnHomeDirPath = pathJoin(firstElement, ".yarn_home");
        }

        return true;
    };

    for (const basename of fs.readdirSync(nodeModuleDirPath)) {
        const path = pathJoin(nodeModuleDirPath, basename);

        if (fs.lstatSync(path).isSymbolicLink()) {
            if (basename.startsWith("@")) {
                return undefined;
            }

            if (!getIsLinkedByGarronejScript(path)) {
                return undefined;
            }

            linkedModuleNames.push(basename);
            continue;
        }

        if (!fs.lstatSync(path).isDirectory()) {
            continue;
        }

        if (basename.startsWith("@")) {
            for (const subBasename of fs.readdirSync(path)) {
                const subPath = pathJoin(path, subBasename);

                if (!fs.lstatSync(subPath).isSymbolicLink()) {
                    continue;
                }

                if (!getIsLinkedByGarronejScript(subPath)) {
                    return undefined;
                }

                linkedModuleNames.push(`${basename}/${subBasename}`);
            }
        }
    }

    if (yarnHomeDirPath === undefined) {
        return undefined;
    }

    return { linkedModuleNames, yarnHomeDirPath };
}

async function installWithoutBreakingLinks(params: {
    packageJsonDirPath: string;
    garronejLinkInfos: Exclude<ReturnType<typeof getGarronejLinkInfos>, undefined>;
}) {
    const {
        packageJsonDirPath,
        garronejLinkInfos: { linkedModuleNames, yarnHomeDirPath }
    } = params;

    const parsedPackageJson = (() => {
        const packageJsonFilePath = pathJoin(packageJsonDirPath, "package.json");

        type ParsedPackageJson = {
            scripts?: Record<string, string>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zTargetType = z.object({
                scripts: z.record(z.string()).optional()
            });

            type InferredType = z.infer<typeof zTargetType>;

            assert<Equals<TargetType, InferredType>>;

            return id<z.ZodType<TargetType>>(zTargetType);
        })();

        const parsedPackageJson = JSON.parse(
            fs.readFileSync(packageJsonFilePath).toString("utf8")
        ) as unknown;

        zParsedPackageJson.parse(parsedPackageJson);
        assert(is<ParsedPackageJson>(parsedPackageJson));

        return parsedPackageJson;
    })();

    const isImplementedScriptByName = {
        postinstall: false,
        prepare: false
    };

    delete_postinstall_script: {
        if (parsedPackageJson.scripts === undefined) {
            break delete_postinstall_script;
        }

        for (const scriptName of objectKeys(isImplementedScriptByName)) {
            if (parsedPackageJson.scripts[scriptName] === undefined) {
                continue;
            }

            isImplementedScriptByName[scriptName] = true;

            delete parsedPackageJson.scripts[scriptName];
        }
    }

    const tmpProjectDirPath = pathJoin(yarnHomeDirPath, "tmpProject");

    if (fs.existsSync(tmpProjectDirPath)) {
        rmSync(tmpProjectDirPath, { recursive: true });
    }

    fs.mkdirSync(tmpProjectDirPath, { recursive: true });

    fs.writeFileSync(
        pathJoin(tmpProjectDirPath, "package.json"),
        JSON.stringify(parsedPackageJson, undefined, 4)
    );

    const YARN_LOCK = "yarn.lock";

    fs.copyFileSync(
        pathJoin(packageJsonDirPath, YARN_LOCK),
        pathJoin(tmpProjectDirPath, YARN_LOCK)
    );

    await runPackageManagerInstall({
        packageManagerBinName: "yarn",
        cwd: tmpProjectDirPath
    });

    // NOTE: Moving the modules from the tmp project to the actual project
    // without messing up the links.
    {
        const { getAreSameVersions } = (() => {
            type ParsedPackageJson = {
                version: string;
            };

            const zParsedPackageJson = (() => {
                type TargetType = ParsedPackageJson;

                const zTargetType = z.object({
                    version: z.string()
                });

                type InferredType = z.infer<typeof zTargetType>;

                assert<Equals<TargetType, InferredType>>;

                return id<z.ZodType<TargetType>>(zTargetType);
            })();

            function readVersion(params: { moduleDirPath: string }): string {
                const { moduleDirPath } = params;

                const packageJsonFilePath = pathJoin(moduleDirPath, "package.json");

                const packageJson = JSON.parse(
                    fs.readFileSync(packageJsonFilePath).toString("utf8")
                );

                zParsedPackageJson.parse(packageJson);
                assert(is<ParsedPackageJson>(packageJson));

                return packageJson.version;
            }

            function getAreSameVersions(params: {
                moduleDirPath_a: string;
                moduleDirPath_b: string;
            }): boolean {
                const { moduleDirPath_a, moduleDirPath_b } = params;

                return (
                    readVersion({ moduleDirPath: moduleDirPath_a }) ===
                    readVersion({ moduleDirPath: moduleDirPath_b })
                );
            }

            return { getAreSameVersions };
        })();

        const nodeModulesDirPath_tmpProject = pathJoin(tmpProjectDirPath, "node_modules");
        const nodeModulesDirPath = pathJoin(packageJsonDirPath, "node_modules");

        const modulePaths = fs
            .readdirSync(nodeModulesDirPath_tmpProject)
            .map(basename => {
                if (basename.startsWith(".")) {
                    return undefined;
                }

                const path = pathJoin(nodeModulesDirPath_tmpProject, basename);

                if (basename.startsWith("@")) {
                    return fs
                        .readdirSync(path)
                        .map(subBasename => {
                            if (subBasename.startsWith(".")) {
                                return undefined;
                            }

                            const subPath = pathJoin(path, subBasename);

                            if (!fs.lstatSync(subPath).isDirectory()) {
                                return undefined;
                            }

                            return {
                                moduleName: `${basename}/${subBasename}`,
                                moduleDirPath_tmpProject: subPath,
                                moduleDirPath: pathJoin(
                                    nodeModulesDirPath,
                                    basename,
                                    subBasename
                                )
                            };
                        })
                        .filter(exclude(undefined));
                }

                if (!fs.lstatSync(path).isDirectory()) {
                    return undefined;
                }

                return [
                    {
                        moduleName: basename,
                        moduleDirPath_tmpProject: path,
                        moduleDirPath: pathJoin(nodeModulesDirPath, basename)
                    }
                ];
            })
            .filter(exclude(undefined))
            .flat();

        for (const {
            moduleName,
            moduleDirPath,
            moduleDirPath_tmpProject
        } of modulePaths) {
            if (linkedModuleNames.includes(moduleName)) {
                continue;
            }

            let doesTargetModuleExist = false;

            skip_condition: {
                if (!fs.existsSync(moduleDirPath)) {
                    break skip_condition;
                }

                doesTargetModuleExist = true;

                const areSameVersions = getAreSameVersions({
                    moduleDirPath_a: moduleDirPath,
                    moduleDirPath_b: moduleDirPath_tmpProject
                });

                if (!areSameVersions) {
                    break skip_condition;
                }

                continue;
            }

            if (doesTargetModuleExist) {
                rmSync(moduleDirPath, { recursive: true });
            }

            {
                const dirPath = pathDirname(moduleDirPath);

                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
            }

            fs.renameSync(moduleDirPath_tmpProject, moduleDirPath);
        }

        move_bin: {
            const binDirPath_tmpProject = pathJoin(nodeModulesDirPath_tmpProject, ".bin");
            const binDirPath = pathJoin(nodeModulesDirPath, ".bin");

            if (!fs.existsSync(binDirPath_tmpProject)) {
                break move_bin;
            }

            for (const basename of fs.readdirSync(binDirPath_tmpProject)) {
                const path_tmpProject = pathJoin(binDirPath_tmpProject, basename);
                const path = pathJoin(binDirPath, basename);

                if (fs.existsSync(path)) {
                    continue;
                }

                fs.renameSync(path_tmpProject, path);
            }
        }
    }

    fs.cpSync(
        pathJoin(tmpProjectDirPath, YARN_LOCK),
        pathJoin(packageJsonDirPath, YARN_LOCK)
    );

    rmSync(tmpProjectDirPath, { recursive: true });

    for (const scriptName of objectKeys(isImplementedScriptByName)) {
        if (!isImplementedScriptByName[scriptName]) {
            continue;
        }

        child_process.execSync(`yarn run ${scriptName}`, {
            cwd: packageJsonDirPath,
            stdio: "inherit"
        });
    }
}
