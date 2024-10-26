import child_process from "child_process";
import chalk from "chalk";

export function exitIfUncommittedChanges(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    let hasUncommittedChanges: boolean | undefined = undefined;

    try {
        hasUncommittedChanges =
            child_process
                .execSync(`git status --porcelain`, {
                    cwd: projectDirPath
                })
                .toString()
                .trim() !== "";
    } catch {
        // Probably not a git repository
        return;
    }

    if (!hasUncommittedChanges) {
        return;
    }
    console.warn(
        [
            chalk.red(
                "Please commit or stash your changes before running this command.\n"
            ),
            "This command will modify your project's files so it's better to have a clean working directory",
            "so that you can easily see what has been changed and revert if needed."
        ].join(" ")
    );

    process.exit(-1);
}
