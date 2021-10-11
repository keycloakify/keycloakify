import { relative as pathRelative } from "path";

export function isInside(params: { dirPath: string; filePath: string }) {
    const { dirPath, filePath } = params;

    return !pathRelative(dirPath, filePath).startsWith("..");
}
