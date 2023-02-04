import { PassThrough, Readable, TransformCallback, Writable } from "stream";
import { pipeline } from "stream/promises";
import { deflateRaw as deflateRawCb, createDeflateRaw } from "zlib";
import { promisify } from "util";

import { crc32 } from "./crc32";
import tee from "./tee";

const deflateRaw = promisify(deflateRawCb);

/**
 * A stream transformer that records the number of bytes
 * passed in its `size` property.
 */
class ByteCounter extends PassThrough {
    size: number = 0;
    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
        if ("length" in chunk) this.size += chunk.length;
        super._transform(chunk, encoding, callback);
    }
}

/**
 * @param data buffer containing the data to be compressed
 * @returns a buffer containing the compressed/deflated data and the crc32 checksum
 *  of the source data
 */
export async function deflateBuffer(data: Buffer) {
    const [deflated, checksum] = await Promise.all([deflateRaw(data), crc32(data)]);
    return { deflated, crc32: checksum };
}

/**
 * @param input a byte stream, containing data to be compressed
 * @param sink a method that will accept chunks of compressed data; We don't pass
 *   a writable here, since we don't want the writablestream to be closed after
 *   a single file
 * @returns a promise, which will resolve with the crc32 checksum and the
 * compressed size
 */
export async function deflateStream(input: Readable, sink: (chunk: Buffer) => void) {
    const deflateWriter = new Writable({
        write(chunk, _, callback) {
            sink(chunk);
            callback();
        }
    });

    // tee the input stream, so we can compress and calc crc32 in parallel
    const [rs1, rs2] = tee(input);
    const byteCounter = new ByteCounter();
    const [_, crc] = await Promise.all([
        // pipe input into zip compressor, count the bytes
        // returned and pass compressed data to the sink
        pipeline(rs1, createDeflateRaw(), byteCounter, deflateWriter),
        // calc checksum
        crc32(rs2)
    ]);

    return { crc32: crc, compressedSize: byteCounter.size };
}
