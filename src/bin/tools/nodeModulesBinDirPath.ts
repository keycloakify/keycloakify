import { sep as pathSep } from "path";

let cache: string | undefined = undefined;

export function getNodeModulesBinDirPath() {
    if (cache !== undefined) {
        return cache;
    }

    const binPath = process.argv[1];

    const segments: string[] = [".bin"];

    let foundNodeModules = false;

    for (const segment of binPath.split(pathSep).reverse()) {
        skip_segment: {
            if (foundNodeModules) {
                break skip_segment;
            }

            if (segment === "node_modules") {
                foundNodeModules = true;
                break skip_segment;
            }

            continue;
        }

        segments.unshift(segment);
    }

    const nodeModulesBinDirPath = segments.join(pathSep);

    cache = nodeModulesBinDirPath;

    return nodeModulesBinDirPath;
}
