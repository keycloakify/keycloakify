import { assert, type Equals, is } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import type { ExtensionModuleMeta } from "./extensionModuleMeta";
import { z } from "zod";
import { id } from "tsafe/id";
import * as fsPr from "fs/promises";
import { SemVer } from "../tools/SemVer";
import { same } from "evt/tools/inDepth/same";
import { runPrettier, getIsPrettierAvailable } from "../tools/runPrettier";
import { npmInstall } from "../tools/npmInstall";
import { dirname as pathDirname } from "path";

export type BuildContextLike = {
    packageJsonFilePath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export type ExtensionModuleMetaLike = {
    moduleName: string;
    peerDependencies: Record<string, string>;
};

assert<ExtensionModuleMeta extends ExtensionModuleMetaLike ? true : false>();

export async function installExtensionModulesPeerDependencies(params: {
    buildContext: BuildContextLike;
    extensionModuleMetas: ExtensionModuleMetaLike[];
}): Promise<void | never> {
    const { buildContext, extensionModuleMetas } = params;

    const { extensionModulesPerDependencies } = (() => {
        const extensionModulesPerDependencies: Record<string, string> = {};

        for (const { peerDependencies } of extensionModuleMetas) {
            for (const [peerDependencyName, versionRange_candidate] of Object.entries(
                peerDependencies
            )) {
                const versionRange = (() => {
                    const versionRange_current =
                        extensionModulesPerDependencies[peerDependencyName];

                    if (versionRange_current === undefined) {
                        return versionRange_candidate;
                    }

                    if (versionRange_current === "*") {
                        return versionRange_candidate;
                    }

                    if (versionRange_candidate === "*") {
                        return versionRange_current;
                    }

                    const { versionRange } = [
                        versionRange_current,
                        versionRange_candidate
                    ]
                        .map(versionRange => ({
                            versionRange,
                            semVer: SemVer.parse(
                                (() => {
                                    if (
                                        versionRange.startsWith("^") ||
                                        versionRange.startsWith("~")
                                    ) {
                                        return versionRange.slice(1);
                                    }

                                    return versionRange;
                                })()
                            )
                        }))
                        .sort((a, b) => SemVer.compare(b.semVer, a.semVer))[0];

                    return versionRange;
                })();

                extensionModulesPerDependencies[peerDependencyName] = versionRange;
            }
        }

        return { extensionModulesPerDependencies };
    })();

    const parsedPackageJson = await (async () => {
        type ParsedPackageJson = {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zParsedPackageJson = z.object({
                dependencies: z.record(z.string()).optional(),
                devDependencies: z.record(z.string()).optional()
            });

            type InferredType = z.infer<typeof zParsedPackageJson>;

            assert<Equals<InferredType, TargetType>>();

            return id<z.ZodType<TargetType>>(zParsedPackageJson);
        })();

        const parsedPackageJson = JSON.parse(
            (await fsPr.readFile(buildContext.packageJsonFilePath)).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return parsedPackageJson;
    })();

    const parsedPackageJson_before = JSON.parse(JSON.stringify(parsedPackageJson));

    for (const [moduleName, versionRange] of Object.entries(
        extensionModulesPerDependencies
    )) {
        if (moduleName.startsWith("@types/")) {
            (parsedPackageJson.devDependencies ??= {})[moduleName] = versionRange;
            continue;
        }

        if (parsedPackageJson.devDependencies !== undefined) {
            delete parsedPackageJson.devDependencies[moduleName];
        }

        (parsedPackageJson.dependencies ??= {})[moduleName] = versionRange;
    }

    if (same(parsedPackageJson, parsedPackageJson_before)) {
        return;
    }

    let packageJsonContentStr = JSON.stringify(parsedPackageJson, null, 2);

    format: {
        if (!(await getIsPrettierAvailable())) {
            break format;
        }

        packageJsonContentStr = await runPrettier({
            sourceCode: packageJsonContentStr,
            filePath: buildContext.packageJsonFilePath
        });
    }

    await fsPr.writeFile(buildContext.packageJsonFilePath, packageJsonContentStr);

    await npmInstall({
        packageJsonDirPath: pathDirname(buildContext.packageJsonFilePath)
    });

    process.exit(0);
}
