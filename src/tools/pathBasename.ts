export function pathBasename(path: string) {
    return path.split("/").reverse()[0];
}
