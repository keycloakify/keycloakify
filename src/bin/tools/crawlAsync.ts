import * as fsPr from "fs/promises";
import { join as pathJoin, relative as pathRelative } from "path";
import { assert, type Equals } from "tsafe/assert";

/** List all files in a given directory return paths relative to the dir_path */
export async function crawlAsync(params: {
    dirPath: string;
    returnedPathsType: "absolute" | "relative to dirPath";
    onFileFound: (filePath: string) => Promise<void>;
}) {
    const { dirPath, returnedPathsType, onFileFound } = params;

    await crawlAsyncRec({
        dirPath,
        onFileFound: async ({ filePath }) => {
            switch (returnedPathsType) {
                case "absolute":
                    await onFileFound(filePath);
                    return;
                case "relative to dirPath":
                    await onFileFound(pathRelative(dirPath, filePath));
                    return;
            }
            assert<Equals<typeof returnedPathsType, never>>();
        }
    });
}

async function crawlAsyncRec(params: {
    dirPath: string;
    onFileFound: (params: { filePath: string }) => Promise<void>;
}) {
    const { dirPath, onFileFound } = params;

    await Promise.all(
        (await fsPr.readdir(dirPath)).map(async basename => {
            const fileOrDirPath = pathJoin(dirPath, basename);

            const isDirectory = await fsPr
                .lstat(fileOrDirPath)
                .then(stat => stat.isDirectory());

            if (isDirectory) {
                await crawlAsyncRec({ dirPath: fileOrDirPath, onFileFound });
                return;
            }

            await onFileFound({ filePath: fileOrDirPath });
        })
    );
}
