import * as fs from "fs/promises";

export async function existsAsync(path: string) {
    try {
        await fs.stat(path);
        return true;
    } catch (error) {
        if ((error as Error & { code: string }).code === "ENOENT") return false;
        throw error;
    }
}
