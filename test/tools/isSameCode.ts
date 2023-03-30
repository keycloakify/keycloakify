export function isSameCode(code1: string, code2: string): boolean {
    const removeSpacesAndNewLines = (code: string) => code.replace(/\s/g, "").replace(/\n/g, "");

    return removeSpacesAndNewLines(code1) === removeSpacesAndNewLines(code2);
}
