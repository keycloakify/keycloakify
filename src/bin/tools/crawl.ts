import * as fs from "fs";
import * as path from "path";

const crawlRec = (dir_path: string, paths: string[]) => {
    for (const file_name of fs.readdirSync(dir_path)) {
        const file_path = path.join(dir_path, file_name);

        if (fs.lstatSync(file_path).isDirectory()) {
            crawlRec(file_path, paths);

            continue;
        }

        paths.push(file_path);
    }
};

/** List all files in a given directory return paths relative to the dir_path */
export function crawl(params: { dirPath: string; returnedPathsType: "absolute" | "relative to dirPath" }): string[] {
    const { dirPath, returnedPathsType } = params;

    const filePaths: string[] = [];

    crawlRec(dirPath, filePaths);

    switch (returnedPathsType) {
        case "absolute":
            return filePaths;
        case "relative to dirPath":
            return filePaths.map(filePath => path.relative(dirPath, filePath));
    }
}
