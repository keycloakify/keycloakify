import { exec as execCallback } from "child_process";
import { createHash } from "crypto";
import { mkdir, stat, writeFile } from "fs/promises";
import fetch, { type FetchOptions } from "make-fetch-happen";
import { dirname as pathDirname, join as pathJoin } from "path";
import { assert } from "tsafe";
import { promisify } from "util";
import { getProjectRoot } from "./getProjectRoot";
import { transformCodebase } from "./transformCodebase";
import { unzip } from "./unzip";

const exec = promisify(execCallback);

function hash(s: string) {
    return createHash("sha256").update(s).digest("hex");
}

async function exists(path: string) {
    try {
        await stat(path);
        return true;
    } catch (error) {
        if ((error as Error & { code: string }).code === "ENOENT") return false;
        throw error;
    }
}

/**
 * Get npm configuration as map
 */
async function getNmpConfig(): Promise<Record<string, string>> {
    const { stdout } = await exec("npm config get", { encoding: "utf8" });
    return stdout
        .split("\n")
        .filter(line => !line.startsWith(";"))
        .map(line => line.trim())
        .map(line => line.split("=", 2))
        .reduce((cfg, [key, value]) => ({ ...cfg, [key]: value }), {});
}

/**
 * Get proxy configuration from npm config files. Note that we don't care about
 * proxy config in env vars, because make-fetch-happen will do that for us.
 *
 * @returns proxy configuration
 */
async function getNpmProxyConfig(): Promise<Pick<FetchOptions, "proxy" | "noProxy">> {
    const cfg = await getNmpConfig();

    const proxy = cfg["https-proxy"] ?? cfg["proxy"];
    const noProxy = cfg["noproxy"] ?? cfg["no-proxy"];

    return { proxy, noProxy };
}

export async function downloadAndUnzip({
    url,
    destDirPath,
    pathOfDirToExtractInArchive
}: {
    url: string;
    destDirPath: string;
    pathOfDirToExtractInArchive?: string;
}) {
    const downloadHash = hash(JSON.stringify({ url })).substring(0, 15);
    const projectRoot = getProjectRoot();
    const cacheRoot = process.env.XDG_CACHE_HOME ?? `${projectRoot}/node_modules/.cache`;
    const zipFilePath = pathJoin(cacheRoot, "keycloakify", "zip", `_${downloadHash}.zip`);
    const extractDirPath = pathJoin(cacheRoot, "keycloakify", "unzip", `_${downloadHash}`);

    if (!(await exists(zipFilePath))) {
        const proxyOpts = await getNpmProxyConfig();
        const response = await fetch(url, proxyOpts);
        await mkdir(pathDirname(zipFilePath), { recursive: true });
        /**
         * The correct way to fix this is to upgrade node-fetch beyond 3.2.5
         * (see https://github.com/node-fetch/node-fetch/issues/1295#issuecomment-1144061991.)
         * Unfortunately, octokit (a dependency of keycloakify) also uses node-fetch, and
         * does not support node-fetch 3.x. So we stick around with this band-aid until
         * octokit upgrades.
         */
        response.body?.setMaxListeners(Number.MAX_VALUE);
        assert(typeof response.body !== "undefined" && response.body != null);
        await writeFile(zipFilePath, response.body);
    }

    await unzip(zipFilePath, extractDirPath, pathOfDirToExtractInArchive);

    transformCodebase({
        "srcDirPath": extractDirPath,
        "destDirPath": destDirPath
    });
}
