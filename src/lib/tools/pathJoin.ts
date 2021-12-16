export function pathJoin(...path: string[]): string {
    return path.map(part => part.replace(/^\/+/, "").replace(/\/+$/, "")).join("/");
}
