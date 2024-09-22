import * as fs from "fs";
import { join } from "path";
import { assert } from "tsafe/assert";
import { transformCodebase } from "../../src/bin/tools/transformCodebase";
import { createPublicKeycloakifyDevResourcesDir } from "./createPublicKeycloakifyDevResourcesDir";
import { createAccountV1Dir } from "./createAccountV1Dir";
import chalk from "chalk";
import { run } from "../shared/run";
import { vendorFrontendDependencies } from "./vendorFrontendDependencies";

(async () => {
    console.log(chalk.cyan("Building Keycloakify..."));

    const startTime = Date.now();

    if (fs.existsSync(join("dist", "bin", "main.original.js"))) {
        fs.renameSync(
            join("dist", "bin", "main.original.js"),
            join("dist", "bin", "main.js")
        );

        fs.readdirSync(join("dist", "bin")).forEach(fileBasename => {
            if (/[0-9]\.index.js/.test(fileBasename) || fileBasename.endsWith(".node")) {
                fs.rmSync(join("dist", "bin", fileBasename));
            }
        });
    }

    run(`npx tsc -p ${join("src", "bin", "tsconfig.json")}`);

    if (
        !fs
            .readFileSync(join("dist", "bin", "main.js"))
            .toString("utf8")
            .includes("__nccwpck_require__")
    ) {
        fs.cpSync(
            join("dist", "bin", "main.js"),
            join("dist", "bin", "main.original.js")
        );
    }

    run(`npx ncc build ${join("dist", "bin", "main.js")} -o ${join("dist", "ncc_out")}`);

    transformCodebase({
        srcDirPath: join("dist", "ncc_out"),
        destDirPath: join("dist", "bin"),
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            if (fileRelativePath === "index.js") {
                return {
                    newFileName: "main.js",
                    modifiedSourceCode: sourceCode
                };
            }

            return { modifiedSourceCode: sourceCode };
        }
    });

    fs.rmSync(join("dist", "ncc_out"), { recursive: true });

    {
        let hasBeenPatched = false;

        fs.readdirSync(join("dist", "bin")).forEach(fileBasename => {
            if (fileBasename !== "main.js" && !fileBasename.endsWith(".index.js")) {
                return;
            }

            const { hasBeenPatched: hasBeenPatched_i } = patchDeprecatedBufferApiUsage(
                join("dist", "bin", fileBasename)
            );

            if (hasBeenPatched_i) {
                hasBeenPatched = true;
            }
        });

        assert(hasBeenPatched);
    }

    fs.chmodSync(
        join("dist", "bin", "main.js"),
        fs.statSync(join("dist", "bin", "main.js")).mode |
            fs.constants.S_IXUSR |
            fs.constants.S_IXGRP |
            fs.constants.S_IXOTH
    );

    run(`npx tsc -p ${join("src", "tsconfig.json")}`);
    run(`npx tsc-alias -p ${join("src", "tsconfig.json")}`);
    vendorFrontendDependencies({ distDirPath: join(process.cwd(), "dist") });

    if (fs.existsSync(join("dist", "vite-plugin", "index.original.js"))) {
        fs.renameSync(
            join("dist", "vite-plugin", "index.original.js"),
            join("dist", "vite-plugin", "index.js")
        );
    }

    run(`npx tsc -p ${join("src", "vite-plugin", "tsconfig.json")}`);

    if (
        !fs
            .readFileSync(join("dist", "vite-plugin", "index.js"))
            .toString("utf8")
            .includes("__nccwpck_require__")
    ) {
        fs.cpSync(
            join("dist", "vite-plugin", "index.js"),
            join("dist", "vite-plugin", "index.original.js")
        );
    }

    run(
        `npx ncc build ${join("dist", "vite-plugin", "index.js")} -o ${join(
            "dist",
            "ncc_out"
        )}`
    );

    fs.readdirSync(join("dist", "ncc_out")).forEach(fileBasename => {
        assert(!fileBasename.endsWith(".index.js"));
        assert(!fileBasename.endsWith(".node"));
    });

    transformCodebase({
        srcDirPath: join("dist", "ncc_out"),
        destDirPath: join("dist", "vite-plugin"),
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            assert(fileRelativePath === "index.js");

            return { modifiedSourceCode: sourceCode };
        }
    });

    fs.rmSync(join("dist", "ncc_out"), { recursive: true });

    {
        const dirBasename = "src";

        const destDirPath = join("dist", dirBasename);

        fs.rmSync(destDirPath, { recursive: true, force: true });

        fs.cpSync(dirBasename, destDirPath, { recursive: true });
    }

    await createPublicKeycloakifyDevResourcesDir();
    await createAccountV1Dir();

    transformCodebase({
        srcDirPath: join("stories"),
        destDirPath: join("dist", "stories"),
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            if (!fileRelativePath.endsWith(".stories.tsx")) {
                return undefined;
            }

            return { modifiedSourceCode: sourceCode };
        }
    });

    console.log(
        chalk.green(`✓ built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`)
    );
})();

function patchDeprecatedBufferApiUsage(filePath: string) {
    const before = fs.readFileSync(filePath).toString("utf8");

    const after = before.replace(
        `var buffer = new Buffer(toRead);`,
        `var buffer = Buffer.allocUnsafe ? Buffer.allocUnsafe(toRead) : new Buffer(toRead);`
    );

    fs.writeFileSync(filePath, Buffer.from(after, "utf8"));

    const hasBeenPatched = after !== before;

    return { hasBeenPatched };
}
