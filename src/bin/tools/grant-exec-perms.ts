
import { getProjectRoot } from "./getProjectRoot";
import { join as pathJoin } from "path";
import child_process from "child_process";

Object.entries<string>(require(pathJoin(getProjectRoot(), "package.json"))["bin"])
    .forEach(([, scriptPath]) => child_process.execSync(`chmod +x ${scriptPath}`, { "cwd": getProjectRoot() }));

