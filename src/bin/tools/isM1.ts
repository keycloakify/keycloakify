import * as os from "os";

export function getIsM1() {
    return os.cpus()[0].model.includes("Apple M1");
}
