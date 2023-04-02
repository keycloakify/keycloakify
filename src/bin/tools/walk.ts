import { readdir } from "fs/promises";
import { resolve } from "path";

/**
 * Asynchronously and recursively walk a directory tree, yielding every file and directory
 * found
 *
 * @param root the starting directory
 * @returns AsyncGenerator
 */
export default async function* walk(root: string): AsyncGenerator<string, void, unknown> {
    for (const entry of await readdir(root, { withFileTypes: true })) {
        const absolutePath = resolve(root, entry.name);
        if (entry.isDirectory()) {
            yield absolutePath;
            yield* walk(absolutePath);
        } else yield absolutePath;
    }
}
