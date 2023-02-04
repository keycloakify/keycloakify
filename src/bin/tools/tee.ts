import { PassThrough, Readable } from "stream";

export default function tee(input: Readable) {
    const a = new PassThrough();
    const b = new PassThrough();

    let aFull = false;
    let bFull = false;

    a.on("drain", () => {
        aFull = false;
        if (!aFull && !bFull) input.resume();
    });
    b.on("drain", () => {
        bFull = false;
        if (!aFull && !bFull) input.resume();
    });

    input.on("error", e => {
        a.emit("error", e);
        b.emit("error", e);
    });

    input.on("data", chunk => {
        aFull = !a.write(chunk);
        bFull = !b.write(chunk);

        if (aFull || bFull) input.pause();
    });

    input.on("end", () => {
        a.end();
        b.end();
    });

    return [a, b] as const;
}
