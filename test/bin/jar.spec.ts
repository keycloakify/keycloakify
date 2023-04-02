import { jarStream, type ZipEntryGenerator } from "keycloakify/bin/tools/jar";
import { fromBuffer, Entry, ZipFile } from "yauzl";
import { it, describe, assert } from "vitest";
import { Readable } from "stream";

type AsyncIterable<T> = {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

async function arrayFromAsync<T>(asyncIterable: AsyncIterable<T>) {
    const chunks: T[] = []
    for await (const chunk of asyncIterable) chunks.push(chunk)
    return chunks
}

async function readToBuffer(stream: NodeJS.ReadableStream) {
    return Buffer.concat(await arrayFromAsync(stream as AsyncIterable<Buffer>))
}

function unzip(buffer: Buffer) {
    return new Promise<ZipFile>((resolve, reject) =>
        fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
            if (err !== null) { reject(err) } else { resolve(zipFile) }
        }))
}

function readEntry(zipFile: ZipFile, entry: Entry): Promise<Readable> {
    return new Promise<Readable>((resolve, reject) => {
        zipFile.openReadStream(entry, (err, stream) => {
            if (err !== null) { reject(err) } else { resolve(stream) }
        })
    })
}

function readAll(zipFile: ZipFile): Promise<Map<string, Buffer>> {
    return new Promise<Map<string, Buffer>>((resolve, reject) => {
        const entries1: Map<string, Buffer> = new Map()
        zipFile.on("entry", async (entry: Entry) => {
            const stream = await readEntry(zipFile, entry)
            const buffer = await readToBuffer(stream)
            entries1.set(entry.fileName, buffer)
            zipFile.readEntry()
        })
        zipFile.on("end", () => resolve(entries1))
        zipFile.on("error", e => reject(e))
        zipFile.readEntry()
    })
}

describe("jar", () => {
    it("creates jar artifacts without error", async () => {
        async function* mockFiles(): ZipEntryGenerator {
            yield { zipPath: "foo", buffer: Buffer.from("foo") }
        }

        const opts = { artifactId: "someArtifactId", groupId: "someGroupId", version: "1.2.3", asyncPathGeneratorFn: mockFiles }
        const zipped = await jarStream(opts);
        const buffered = await readToBuffer(zipped.outputStream)
        const unzipped = await unzip(buffered)
        const entries = await readAll(unzipped)

        assert.equal(entries.size, 3)
        assert.isOk(entries.has("foo"))
        assert.isOk(entries.has("META-INF/MANIFEST.MF"))
        assert.isOk(entries.has("META-INF/maven/someGroupId/someArtifactId/pom.properties"))

        assert.equal("foo", entries.get("foo")?.toString("utf-8"))

        const manifest = entries.get("META-INF/MANIFEST.MF")?.toString("utf-8")
        const pomProperties = entries.get("META-INF/maven/someGroupId/someArtifactId/pom.properties")?.toString("utf-8")

        assert.isOk(manifest?.includes("Created-By: Keycloakify"))
        assert.isOk(pomProperties?.includes("1.2.3"))
        assert.isOk(pomProperties?.includes("someGroupId"))
        assert.isOk(pomProperties?.includes("someArtifactId"))

    });
});
