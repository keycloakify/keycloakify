import * as child_process from "child_process";

export type ContainerRuntime = "docker" | "podman";

/**
 * Returns `"docker"` if the `docker` CLI is available (including `podman-docker`
 * shims), falling back to `"podman"` if `docker` is not installed.
 */
export function getContainerRuntime(): ContainerRuntime | undefined {
    for (const runtime of ["docker", "podman"] as const) {
        let commandOutput: string;

        try {
            commandOutput = child_process
                .execSync(`${runtime} --version`, {
                    stdio: ["ignore", "pipe", "ignore"]
                })
                .toString("utf8");
        } catch {
            continue;
        }

        const normalizedOutput = commandOutput.trim().toLowerCase();

        if (normalizedOutput.includes("docker") || normalizedOutput.includes("podman")) {
            return runtime;
        }
    }

    return undefined;
}
