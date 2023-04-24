import { exec as execCallback } from "child_process";
import { createHash } from "crypto";
import { mkdir, readFile, stat, writeFile } from "fs/promises";
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

function ensureArray<T>(arg0: T | T[]) {
    return Array.isArray(arg0) ? arg0 : typeof arg0 === "undefined" ? [] : [arg0];
}

function ensureSingleOrNone<T>(arg0: T | T[]) {
    if (!Array.isArray(arg0)) return arg0;
    if (arg0.length === 0) return undefined;
    if (arg0.length === 1) return arg0[0];
    throw new Error("Illegal configuration, expected a single value but found multiple: " + arg0.map(String).join(", "));
}

type NPMConfig = Record<string, string | string[]>;

const npmConfigReducer = (cfg: NPMConfig, [key, value]: [string, string]) =>
    key in cfg ? { ...cfg, [key]: [...ensureArray(cfg[key]), value] } : { ...cfg, [key]: value };

/**
 * Get npm configuration as map
 */
async function getNmpConfig() {
    return readNpmConfig().then(parseNpmConfig);
}

async function readNpmConfig() {
    const { stdout } = await exec("npm config get", { encoding: "utf8" });
    return stdout;
}

function parseNpmConfig(stdout: string) {
    return stdout
        .split("\n")
        .filter(line => !line.startsWith(";"))
        .map(line => line.trim())
        .map(line => line.split("=", 2) as [string, string])
        .reduce(npmConfigReducer, {} as NPMConfig);
}

function maybeBoolean(arg0: string | undefined) {
    return typeof arg0 === "undefined" ? undefined : Boolean(arg0);
}

function chunks<T>(arr: T[], size: number = 2) {
    return arr.map((_, i) => i % size == 0 && arr.slice(i, i + size)).filter(Boolean) as T[][];
}

async function readCafile(cafile: string) {
    const cafileContent = await readFile(cafile, "utf-8");
    return chunks(cafileContent.split(/(-----END CERTIFICATE-----)/), 2).map(ca => ca.join("").replace(/^\n/, "").replace(/\n/g, "\\n"));
}

/**
 * Get proxy and ssl configuration from npm config files. Note that we don't care about
 * proxy config in env vars, because make-fetch-happen will do that for us.
 *
 * @returns proxy configuration
 */
async function getFetchOptions(): Promise<Pick<FetchOptions, "proxy" | "noProxy" | "strictSSL" | "ca" | "cert">> {
    const cfg = await getNmpConfig();

    const proxy = ensureSingleOrNone(cfg["https-proxy"] ?? cfg["proxy"]);
    const noProxy = cfg["noproxy"] ?? cfg["no-proxy"];
    const strictSSL = maybeBoolean(ensureSingleOrNone(cfg["strict-ssl"]));
    const cert = cfg["cert"];
    const ca = ensureArray(cfg["ca"] ?? cfg["ca[]"]);
    const cafile = ensureSingleOrNone(cfg["cafile"]);

    if (typeof cafile !== "undefined" && cafile !== "null") ca.push(...(await readCafile(cafile)));

    return { proxy, noProxy, strictSSL, cert, ca: ca.length === 0 ? undefined : ca };
}

export async function downloadAndUnzip(params: { url: string; destDirPath: string; pathOfDirToExtractInArchive?: string }) {
    const { url, destDirPath, pathOfDirToExtractInArchive } = params;

    const downloadHash = hash(JSON.stringify({ url })).substring(0, 15);
    const projectRoot = getProjectRoot();
    const cacheRoot = process.env.XDG_CACHE_HOME ?? pathJoin(projectRoot, "node_modules", ".cache");
    const zipFilePath = pathJoin(cacheRoot, "keycloakify", "zip", `_${downloadHash}.zip`);
    const extractDirPath = pathJoin(cacheRoot, "keycloakify", "unzip", `_${downloadHash}`);

    if (!(await exists(zipFilePath))) {
        const opts = await getFetchOptions();
        const response = await fetch(url, opts);
        await mkdir(pathDirname(zipFilePath), { "recursive": true });
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
