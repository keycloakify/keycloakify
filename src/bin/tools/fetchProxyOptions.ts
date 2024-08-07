import { type FetchOptions } from "make-fetch-happen";
import * as child_process from "child_process";
import * as fs from "fs";
import { exclude } from "tsafe/exclude";

export type ProxyFetchOptions = Pick<
    FetchOptions,
    "proxy" | "noProxy" | "strictSSL" | "cert" | "ca"
>;

export function getProxyFetchOptions(params: {
    npmConfigGetCwd: string;
}): ProxyFetchOptions {
    const { npmConfigGetCwd } = params;

    const cfg = (() => {
        const output = child_process
            .execSync("npm config get", {
                cwd: npmConfigGetCwd
            })
            .toString("utf8");

        return output
            .split("\n")
            .filter(line => !line.startsWith(";"))
            .map(line => line.trim())
            .map(line => {
                const [key, value] = line.split("=");
                if (key === undefined) {
                    return undefined;
                }
                if (value === undefined) {
                    return undefined;
                }
                return [key.trim(), value.trim()] as const;
            })
            .filter(exclude(undefined))
            .filter(([key]) => key !== "")
            .map(([key, value]) => {
                if (value.startsWith('"') && value.endsWith('"')) {
                    return [key, value.slice(1, -1)] as const;
                }

                if (value === "true" || value === "false") {
                    return [key, value] as const;
                }

                return undefined;
            })
            .filter(exclude(undefined))
            .reduce(
                (cfg: Record<string, string | string[]>, [key, value]) =>
                    key in cfg
                        ? { ...cfg, [key]: [...ensureArray(cfg[key]), value] }
                        : { ...cfg, [key]: value },
                {}
            );
    })();

    const proxy = ensureSingleOrNone(cfg["https-proxy"] ?? cfg["proxy"]);

    const noProxy = cfg["noproxy"] ?? cfg["no-proxy"];

    const strictSSL = ensureSingleOrNone(cfg["strict-ssl"]) === "true";

    const cert = cfg["cert"];

    const ca = ensureArray(cfg["ca"] ?? cfg["ca[]"]);

    const cafile = ensureSingleOrNone(cfg["cafile"]);

    if (cafile !== undefined) {
        ca.push(
            ...(() => {
                const cafileContent = fs.readFileSync(cafile).toString("utf8");

                const newLinePlaceholder = "NEW_LINE_PLACEHOLDER_xIsPsK23svt";

                const chunks = <T>(arr: T[], size: number = 2) =>
                    arr
                        .map((_, i) => i % size == 0 && arr.slice(i, i + size))
                        .filter(Boolean) as T[][];

                return chunks(cafileContent.split(/(-----END CERTIFICATE-----)/), 2).map(
                    ca =>
                        ca
                            .join("")
                            .replace(/\r?\n/g, newLinePlaceholder)
                            .replace(new RegExp(`^${newLinePlaceholder}`), "")
                            .replace(new RegExp(newLinePlaceholder, "g"), "\\n")
                );
            })()
        );
    }

    return {
        proxy,
        noProxy,
        strictSSL,
        cert,
        ca: ca.length === 0 ? undefined : ca
    };
}

function ensureArray<T>(arg0: T | T[]) {
    return Array.isArray(arg0) ? arg0 : arg0 === undefined ? [] : [arg0];
}

function ensureSingleOrNone<T>(arg0: T | T[]) {
    if (!Array.isArray(arg0)) return arg0;
    if (arg0.length === 0) return undefined;
    if (arg0.length === 1) return arg0[0];
    throw new Error(
        "Illegal configuration, expected a single value but found multiple: " +
            arg0.map(String).join(", ")
    );
}
