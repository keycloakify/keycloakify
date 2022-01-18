export function pathJoin(...path: string[]): string {
    return path
        .map((part, i) => (i === 0 ? part : part.replace(/^\/+/, "")))
        .map((part, i) => (i === path.length - 1 ? part : part.replace(/\/+$/, "")))
        .join("/");
}
