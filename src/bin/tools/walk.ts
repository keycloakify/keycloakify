import { readdir } from "fs/promises";
import { resolve, sep } from "path";

/**
 * Asynchronously and recursively walk a directory tree, yielding every file and directory
 * found. Directory paths will _always_ end with a path separator.
 *
 * @param root the starting directory
 * @returns AsyncGenerator
 */
export default async function* walk(root: string): AsyncGenerator<string, void, unknown> {
    for (const entry of await readdir(root, { withFileTypes: true })) {
        const absolutePath = resolve(root, entry.name);
        if (entry.isDirectory()) {
            yield absolutePath.endsWith(sep) ? absolutePath : absolutePath + sep;
            yield* walk(absolutePath);
        } else yield absolutePath.endsWith(sep) ? absolutePath.substring(0, absolutePath.length - 1) : absolutePath;
    }
}
