import { exec as execCallback } from "child_process";
import { createHash } from "crypto";
import { mkdir, readFile, stat, writeFile, unlink, rm } from "fs/promises";
import fetch, { type FetchOptions } from "make-fetch-happen";
import { dirname as pathDirname, join as pathJoin, resolve as pathResolve, sep as pathSep } from "path";
import { assert } from "tsafe/assert";
import { promisify } from "util";
import { transformCodebase } from "./transformCodebase";
import { unzip, zip } from "./unzip";

const exec = promisify(execCallback);

function generateFileNameFromURL(params: {
    url: string;
    preCacheTransform:
        | {
              actionCacheId: string;
              actionFootprint: string;
          }
        | undefined;
}): string {
    const { preCacheTransform } = params;

    // Parse the URL
    const url = new URL(params.url);

    // Extract pathname and remove leading slashes
    let fileName = url.pathname.replace(/^\//, "").replace(/\//g, "_");

    // Optionally, add query parameters replacing special characters
    if (url.search) {
        fileName += url.search.replace(/[&=?]/g, "-");
    }

    // Replace any characters that are not valid in filenames
    fileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "");

    // Trim or pad the fileName to a specific length
    fileName = fileName.substring(0, 50);

    add_pre_cache_transform: {
        if (preCacheTransform === undefined) {
            break add_pre_cache_transform;
        }

        // Sanitize actionCacheId the same way as other components
        const sanitizedActionCacheId = preCacheTransform.actionCacheId.replace(/[^a-zA-Z0-9-_]/g, "_");

        fileName += `_${sanitizedActionCacheId}_${createHash("sha256").update(preCacheTransform.actionFootprint).digest("hex").substring(0, 5)}`;
    }

    return fileName;
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

function readNpmConfig(): Promise<string> {
    return (async function callee(depth: number): Promise<string> {
        const cwd = pathResolve(pathJoin(...[process.cwd(), ...Array(depth).fill("..")]));

        let stdout: string;

        try {
            stdout = await exec("npm config get", { "encoding": "utf8", cwd }).then(({ stdout }) => stdout);
        } catch (error) {
            if (String(error).includes("ENOWORKSPACES")) {
                assert(cwd !== pathSep);

                return callee(depth + 1);
            }

            throw error;
        }

        return stdout;
    })(0);
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

export async function downloadAndUnzip(
    params: {
        url: string;
        destDirPath: string;
        specificDirsToExtract?: string[];
        preCacheTransform?: {
            actionCacheId: string;
            action: (params: { destDirPath: string }) => Promise<void>;
        };
    } & (
        | {
              doUseCache: true;
              projectDirPath: string;
          }
        | {
              doUseCache: false;
          }
    )
) {
    const { url, destDirPath, specificDirsToExtract, preCacheTransform, ...rest } = params;

    const zipFileBasename = generateFileNameFromURL({
        url,
        "preCacheTransform":
            preCacheTransform === undefined
                ? undefined
                : {
                      "actionCacheId": preCacheTransform.actionCacheId,
                      "actionFootprint": preCacheTransform.action.toString()
                  }
    });

    const cacheRoot = !rest.doUseCache
        ? `tmp_${Math.random().toString().slice(2, 12)}`
        : pathJoin(process.env.XDG_CACHE_HOME ?? pathJoin(rest.projectDirPath, "node_modules", ".cache"), "keycloakify");
    const zipFilePath = pathJoin(cacheRoot, `${zipFileBasename}.zip`);
    const extractDirPath = pathJoin(cacheRoot, `tmp_unzip_${zipFileBasename}`);

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

        if (specificDirsToExtract !== undefined || preCacheTransform !== undefined) {
            await unzip(zipFilePath, extractDirPath, specificDirsToExtract);

            await preCacheTransform?.action({
                "destDirPath": extractDirPath
            });

            await unlink(zipFilePath);

            await zip(extractDirPath, zipFilePath);

            await rm(extractDirPath, { "recursive": true });
        }
    }

    await unzip(zipFilePath, extractDirPath);

    transformCodebase({
        "srcDirPath": extractDirPath,
        "destDirPath": destDirPath
    });

    if (!rest.doUseCache) {
        await rm(cacheRoot, { "recursive": true });
    } else {
        await rm(extractDirPath, { "recursive": true });
    }
}
