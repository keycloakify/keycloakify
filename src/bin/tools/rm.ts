import { execSync } from "child_process";

function rmInternal(params: { pathToRemove: string; args: string | undefined; cwd: string | undefined }) {
    const { pathToRemove, args, cwd } = params;

    execSync(`rm ${args ? `-${args} ` : ""}${pathToRemove.replace(/ /g, "\\ ")}`, cwd !== undefined ? { cwd } : undefined);
}

export function rm(pathToRemove: string, options?: { cwd: string }) {
    rmInternal({
        pathToRemove,
        "args": undefined,
        "cwd": options?.cwd,
    });
}

export function rm_r(pathToRemove: string, options?: { cwd: string }) {
    rmInternal({
        pathToRemove,
        "args": "r",
        "cwd": options?.cwd,
    });
}

export function rm_rf(pathToRemove: string, options?: { cwd: string }) {
    rmInternal({
        pathToRemove,
        "args": "rf",
        "cwd": options?.cwd,
    });
}
