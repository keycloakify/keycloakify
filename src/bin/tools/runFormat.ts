import * as fs from "fs";
import { dirname as pathDirname } from "path";
import { assert, Equals } from "tsafe/assert";
import chalk from "chalk";
import { id } from "tsafe/id";
import { z } from "zod";
import { is } from "tsafe/is";
import * as child_process from "child_process";

export function runFormat(params: { packageJsonFilePath: string }) {
    const { packageJsonFilePath } = params;

    const parsedPackageJson = (() => {
        type ParsedPackageJson = {
            scripts?: Record<string, string>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zTargetType = z.object({
                scripts: z.record(z.string()).optional()
            });

            assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

            return id<z.ZodType<TargetType>>(zTargetType);
        })();

        const parsedPackageJson = JSON.parse(
            fs.readFileSync(packageJsonFilePath).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return parsedPackageJson;
    })();

    const { scripts } = parsedPackageJson;

    if (scripts === undefined) {
        return;
    }

    const scriptKeys = Object.keys(scripts);
    const scriptNames = scriptKeys.filter(scriptKey =>
        scriptKey.trim().match(/^(lint|format)/)
    );

    for (const scriptName of scriptNames) {
        if (!(scriptName in scripts)) {
            continue;
        }

        const command = `npm run ${scriptName}`;

        console.log(chalk.grey(`$ ${command}`));

        try {
            child_process.execSync(`npm run ${scriptName}`, {
                stdio: "inherit",
                cwd: pathDirname(packageJsonFilePath)
            });
        } catch {
            console.log(
                chalk.yellow(
                    `\`${command}\` failed, it does not matter, please format your code manually, continuing...`
                )
            );
        }

        return;
    }
}
