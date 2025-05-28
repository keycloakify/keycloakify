import { assert, type Equals, is } from "tsafe/assert";
import { id } from "tsafe/id";
import { z } from "zod";
import { join as pathJoin, dirname as pathDirname } from "path";
import * as fsPr from "fs/promises";
import { getInstalledModuleDirPath } from "../tools/getInstalledModuleDirPath";
import { exclude } from "tsafe/exclude";

export async function listInstalledModules(params: {
    packageJsonFilePath: string;
    filter: (params: { moduleName: string }) => boolean;
}): Promise<
    {
        moduleName: string;
        version: string;
        dirPath: string;
        peerDependencies: Record<string, string>;
    }[]
> {
    const { packageJsonFilePath, filter } = params;

    const parsedPackageJson = await readPackageJsonDependencies({
        packageJsonFilePath
    });

    const moduleNames = (
        [parsedPackageJson.dependencies, parsedPackageJson.devDependencies] as const
    )
        .filter(exclude(undefined))
        .map(obj => Object.keys(obj))
        .flat()
        .filter(moduleName => filter({ moduleName }));

    const result = await Promise.all(
        moduleNames.map(async moduleName => {
            const dirPath = await getInstalledModuleDirPath({
                moduleName,
                packageJsonDirPath: pathDirname(packageJsonFilePath)
            });

            const { version, peerDependencies } =
                await readPackageJsonVersionAndPeerDependencies({
                    packageJsonFilePath: pathJoin(dirPath, "package.json")
                });

            return { moduleName, version, peerDependencies, dirPath } as const;
        })
    );

    return result;
}

const { readPackageJsonDependencies } = (() => {
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

    async function readPackageJsonDependencies(params: { packageJsonFilePath: string }) {
        const { packageJsonFilePath } = params;

        const parsedPackageJson = JSON.parse(
            (await fsPr.readFile(packageJsonFilePath)).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return parsedPackageJson;
    }

    return { readPackageJsonDependencies };
})();

const { readPackageJsonVersionAndPeerDependencies } = (() => {
    type ParsedPackageJson = {
        version: string;
        peerDependencies?: Record<string, string>;
    };

    const zParsedPackageJson = (() => {
        type TargetType = ParsedPackageJson;

        const zTargetType = z.object({
            version: z.string(),
            peerDependencies: z.record(z.string()).optional()
        });

        assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

        return id<z.ZodType<TargetType>>(zTargetType);
    })();

    async function readPackageJsonVersionAndPeerDependencies(params: {
        packageJsonFilePath: string;
    }): Promise<{ version: string; peerDependencies: Record<string, string> }> {
        const { packageJsonFilePath } = params;

        const parsedPackageJson = JSON.parse(
            (await fsPr.readFile(packageJsonFilePath)).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return {
            version: parsedPackageJson.version,
            peerDependencies: parsedPackageJson.peerDependencies ?? {}
        };
    }

    return { readPackageJsonVersionAndPeerDependencies };
})();
