import * as fs from "fs/promises";
import * as path from "path";

/** List all files in a given directory return paths relative to the dir_path */
export const crawl = (() => {
    const crawlRec = async (dir_path: string, paths: string[]) => {
        for (const file_name of await fs.readdir(dir_path)) {
            const file_path = path.join(dir_path, file_name);

            if ((await fs.lstat(file_path)).isDirectory()) {
                await crawlRec(file_path, paths);

                continue;
            }

            paths.push(file_path);
        }
    };

    return async function crawl(dir_path: string): Promise<string[]> {
        const paths: string[] = [];

        await crawlRec(dir_path, paths);

        return paths.map(file_path => path.relative(dir_path, file_path));
    };
})();
