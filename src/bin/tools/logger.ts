import debug from "debug";
import minimist from "minimist";

// order is significant, higher lvl include lower ones
// default level is info, i.e. errors, warnings and info will be printed
const levels = ["error", "warn", "info", "debug", "trace"] as const;
export type LogLevel = (typeof levels)[number];

const log = debug("keycloakify");
const loggers = Object.fromEntries(levels.map(lvl => [lvl, log.extend(lvl)])) as Record<LogLevel, typeof log>;

function ensureLogLevel(lvl: string) {
    if (!(levels as readonly string[]).includes(lvl)) throw new Error(`Unknown logLevel ${lvl}, accepted values are ${levels.join(", ")}`);
    return lvl as LogLevel;
}

function extend(key: string) {
    return Object.fromEntries(Object.entries(loggers).map(([k, v]) => [k, v.extend(key)])) as typeof loggers;
}

function getLogLevel(): LogLevel {
    const opts = minimist(process.argv.slice(2));
    if ("trace" in opts) return "trace";
    if ("verbose" in opts) return "debug";
    if ("silent" in opts) return "error";
    if ("warn" in opts) return "warn";
    if ("logLevel" in opts) return ensureLogLevel(opts["logLevel"]);
    return "info";
}

export function setLogLevel(setLvl?: LogLevel) {
    const setIdx = levels.indexOf(setLvl ?? getLogLevel());
    levels.forEach((lvl, idx) => {
        if (idx <= setIdx) debug.enable(`keycloakify:${lvl}:*`);
    });
}

export function getLogger(key?: string) {
    return typeof key === "undefined" ? loggers : extend(key);
}
