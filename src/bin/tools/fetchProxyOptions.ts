import { exec as execCallback } from "child_process";
import { readFile } from "fs/promises";
import { type FetchOptions } from "make-fetch-happen";
import { promisify } from "util";

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

/**
 * Get npm configuration as map
 */
async function getNmpConfig(params: { npmWorkspaceRootDirPath: string }) {
    const { npmWorkspaceRootDirPath } = params;

    const exec = promisify(execCallback);

    const stdout = await exec("npm config get", { "encoding": "utf8", "cwd": npmWorkspaceRootDirPath }).then(({ stdout }) => stdout);

    const npmConfigReducer = (cfg: NPMConfig, [key, value]: [string, string]) =>
        key in cfg ? { ...cfg, [key]: [...ensureArray(cfg[key]), value] } : { ...cfg, [key]: value };

    return stdout
        .split("\n")
        .filter(line => !line.startsWith(";"))
        .map(line => line.trim())
        .map(line => line.split("=", 2) as [string, string])
        .reduce(npmConfigReducer, {} as NPMConfig);
}

export type ProxyFetchOptions = Pick<FetchOptions, "proxy" | "noProxy" | "strictSSL" | "cert" | "ca">;

export async function getProxyFetchOptions(params: { npmWorkspaceRootDirPath: string }): Promise<ProxyFetchOptions> {
    const { npmWorkspaceRootDirPath } = params;

    const cfg = await getNmpConfig({ npmWorkspaceRootDirPath });

    const proxy = ensureSingleOrNone(cfg["https-proxy"] ?? cfg["proxy"]);
    const noProxy = cfg["noproxy"] ?? cfg["no-proxy"];

    function maybeBoolean(arg0: string | undefined) {
        return typeof arg0 === "undefined" ? undefined : Boolean(arg0);
    }

    const strictSSL = maybeBoolean(ensureSingleOrNone(cfg["strict-ssl"]));
    const cert = cfg["cert"];
    const ca = ensureArray(cfg["ca"] ?? cfg["ca[]"]);
    const cafile = ensureSingleOrNone(cfg["cafile"]);

    if (typeof cafile !== "undefined" && cafile !== "null") {
        ca.push(
            ...(await (async () => {
                function chunks<T>(arr: T[], size: number = 2) {
                    return arr.map((_, i) => i % size == 0 && arr.slice(i, i + size)).filter(Boolean) as T[][];
                }

                const cafileContent = await readFile(cafile, "utf-8");
                return chunks(cafileContent.split(/(-----END CERTIFICATE-----)/), 2).map(ca => ca.join("").replace(/^\n/, "").replace(/\n/g, "\\n"));
            })())
        );
    }

    return { proxy, noProxy, strictSSL, cert, "ca": ca.length === 0 ? undefined : ca };
}
