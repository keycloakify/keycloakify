import { execSync } from "child_process";
import { join as pathJoin, relative as pathRelative } from "path";
import { getThisCodebaseRootDirPath } from "../src/bin/tools/getThisCodebaseRootDirPath";
import * as fs from "fs";
import * as os from "os";

const singletonDependencies: string[] = ["react", "@types/react"];

// For example [ "@emotion" ] it's more convenient than
// having to list every sub emotion packages (@emotion/css @emotion/utils ...)
// in singletonDependencies
const namespaceSingletonDependencies: string[] = [];

const rootDirPath = getThisCodebaseRootDirPath();

const commonThirdPartyDeps = [
    ...namespaceSingletonDependencies
        .map(namespaceModuleName =>
            fs
                .readdirSync(pathJoin(rootDirPath, "node_modules", namespaceModuleName))
                .map(submoduleName => `${namespaceModuleName}/${submoduleName}`)
        )
        .reduce((prev, curr) => [...prev, ...curr], []),
    ...singletonDependencies
];

//NOTE: This is only required because of: https://github.com/garronej/ts-ci/blob/c0e207b9677523d4ec97fe672ddd72ccbb3c1cc4/README.md?plain=1#L54-L58
{
    let modifiedPackageJsonContent = fs
        .readFileSync(pathJoin(rootDirPath, "package.json"))
        .toString("utf8");

    modifiedPackageJsonContent = (() => {
        const o = JSON.parse(modifiedPackageJsonContent);

        delete o.files;

        return JSON.stringify(o, null, 2);
    })();

    modifiedPackageJsonContent = modifiedPackageJsonContent
        .replace(/"dist\//g, '"')
        .replace(/"\.\/dist\//g, '"./')
        .replace(/"!dist\//g, '"!')
        .replace(/"!\.\/dist\//g, '"!./');

    modifiedPackageJsonContent = JSON.stringify(
        {
            ...JSON.parse(modifiedPackageJsonContent),
            version: `0.0.0-rc.${~~(Math.random() * 1000000)}`
        },
        null,
        4
    );

    fs.writeFileSync(
        pathJoin(rootDirPath, "dist", "package.json"),
        Buffer.from(modifiedPackageJsonContent, "utf8")
    );
}
const yarnGlobalDirPath = pathJoin(rootDirPath, ".yarn_home");

fs.rmSync(yarnGlobalDirPath, { recursive: true, force: true });
fs.mkdirSync(yarnGlobalDirPath);

const execYarnLink = (params: { targetModuleName?: string; cwd: string }) => {
    const { targetModuleName, cwd } = params;

    if (targetModuleName === undefined) {
        const packageJsonFilePath = pathJoin(cwd, "package.json");

        const packageJson = JSON.parse(
            fs.readFileSync(packageJsonFilePath).toString("utf8")
        );

        delete packageJson["packageManager"];

        fs.writeFileSync(
            packageJsonFilePath,
            Buffer.from(JSON.stringify(packageJson, null, 2))
        );
    }

    const cmd = [
        "yarn",
        "link",
        ...(targetModuleName !== undefined ? [targetModuleName] : ["--no-bin-links"])
    ].join(" ");

    console.log(`$ cd ${pathRelative(rootDirPath, cwd) || "."} && ${cmd}`);

    execSync(cmd, {
        cwd,
        env: {
            ...process.env,
            ...(os.platform() === "win32"
                ? {
                      USERPROFILE: yarnGlobalDirPath,
                      LOCALAPPDATA: yarnGlobalDirPath
                  }
                : { HOME: yarnGlobalDirPath })
        }
    });
};

const testAppPaths = (() => {
    const [, , ...testAppNames] = process.argv;

    return testAppNames
        .map(testAppName => {
            const testAppPath = pathJoin(rootDirPath, "..", testAppName);

            if (fs.existsSync(testAppPath)) {
                return testAppPath;
            }

            console.warn(
                `Skipping ${testAppName} since it cant be found here: ${testAppPath}`
            );

            return undefined;
        })
        .filter((path): path is string => path !== undefined);
})();

if (testAppPaths.length === 0) {
    console.error("No test app to link into!");
    process.exit(-1);
}

testAppPaths.forEach(testAppPath => {
    const packageJsonFilePath = pathJoin(testAppPath, "package.json");

    const packageJsonContent = fs.readFileSync(packageJsonFilePath);

    const parsedPackageJson = JSON.parse(packageJsonContent.toString("utf8")) as {
        scripts?: Record<string, string>;
    };

    let hasPostInstallOrPrepareScript = false;

    if (parsedPackageJson.scripts !== undefined) {
        for (const scriptName of ["postinstall", "prepare"]) {
            if (parsedPackageJson.scripts[scriptName] === undefined) {
                continue;
            }

            hasPostInstallOrPrepareScript = true;

            delete parsedPackageJson.scripts[scriptName];
        }
    }

    if (hasPostInstallOrPrepareScript) {
        fs.writeFileSync(
            packageJsonFilePath,
            Buffer.from(JSON.stringify(parsedPackageJson, null, 2), "utf8")
        );
    }

    const restorePackageJson = () => {
        if (!hasPostInstallOrPrepareScript) {
            return;
        }

        fs.writeFileSync(packageJsonFilePath, packageJsonContent);
    };

    try {
        execSync("yarn install", { cwd: testAppPath });
    } catch (error) {
        restorePackageJson();

        throw error;
    }

    restorePackageJson();
});

console.log("=== Linking common dependencies ===");

const total = commonThirdPartyDeps.length;
let current = 0;

commonThirdPartyDeps.forEach(commonThirdPartyDep => {
    current++;

    console.log(`${current}/${total} ${commonThirdPartyDep}`);

    const localInstallPath = pathJoin(
        ...[
            rootDirPath,
            "node_modules",
            ...(commonThirdPartyDep.startsWith("@")
                ? commonThirdPartyDep.split("/")
                : [commonThirdPartyDep])
        ]
    );

    execYarnLink({ cwd: localInstallPath });
});

commonThirdPartyDeps.forEach(commonThirdPartyDep =>
    testAppPaths.forEach(testAppPath =>
        execYarnLink({
            cwd: testAppPath,
            targetModuleName: commonThirdPartyDep
        })
    )
);

console.log("=== Linking in house dependencies ===");

execYarnLink({ cwd: pathJoin(rootDirPath, "dist") });

testAppPaths.forEach(testAppPath =>
    execYarnLink({
        cwd: testAppPath,
        targetModuleName: JSON.parse(
            fs.readFileSync(pathJoin(rootDirPath, "package.json")).toString("utf8")
        )["name"]
    })
);

testAppPaths.forEach(testAppPath => {
    const { scripts = {} } = JSON.parse(
        fs.readFileSync(pathJoin(testAppPath, "package.json")).toString("utf8")
    ) as {
        scripts?: Record<string, string>;
    };

    for (const scriptName of ["postinstall", "prepare"]) {
        if (scripts[scriptName] === undefined) {
            continue;
        }

        execSync(`yarn run ${scriptName}`, { cwd: testAppPath });
    }
});

export {};
