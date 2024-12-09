import * as fs from "node:fs";
import path from "node:path";
import * as os from "node:os";

type Listing = { [filename: string]: string };

/**
 * Create fixtures from provided listing in temp folder
 * Alternative for mock-fs which is also mocking nodejs require calls
 *
 * returns a path to tmp directory with fixtures
 */
export async function createFixtures(listing: Listing) {
    const tmpDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), `keycloackify-test-${process.pid}`)
    );

    for (const [filename, value] of Object.entries(listing)) {
        await fs.promises.mkdir(path.join(tmpDir, path.dirname(filename)), {
            recursive: true
        });
        await fs.promises.writeFile(path.join(tmpDir, filename), value);
    }
    return tmpDir;
}

/**
 * Print FS to the listing, handy to use with snapshots
 */
export function readFsToListing(
    directory: string,
    filter?: (filename: string) => boolean
): Record<string, string> {
    const out: Record<string, string> = {};

    function readDirRecursive(currentDir: string, parentPath = ""): void {
        const entries = fs.readdirSync(currentDir);

        entries.forEach(entry => {
            const filepath = path.join(currentDir, entry);
            const relativePath = parentPath ? `${parentPath}/${entry}` : entry;

            if (fs.lstatSync(filepath).isDirectory()) {
                readDirRecursive(filepath, relativePath);
            } else if (!filter || filter(entry)) {
                out[relativePath] = fs.readFileSync(filepath, "utf-8");
            }
        });
    }

    readDirRecursive(directory);
    return out;
}
