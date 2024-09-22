import * as child_process from "child_process";
import chalk from "chalk";

export function run(command: string, options?: { cwd: string }) {
    console.log(chalk.grey(`$ ${command}`));

    child_process.execSync(command, { stdio: "inherit", ...options });
}
