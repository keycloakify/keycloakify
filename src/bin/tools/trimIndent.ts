/**
 * Concatenate the string fragments and interpolated values
 * to get a single string.
 */
function populateTemplate(strings: TemplateStringsArray, ...args: unknown[]) {
    const chunks: string[] = [];
    for (let i = 0; i < strings.length; i++) {
        let lastStringLineLength = 0;
        if (strings[i]) {
            chunks.push(strings[i]);
            // remember last indent of the string portion
            lastStringLineLength = strings[i].split("\n").at(-1)?.length ?? 0;
        }
        if (args[i]) {
            // if the interpolation value has newlines, indent the interpolation values
            // using the last known string indent
            const chunk = String(args[i]).replace(/([\r?\n])/g, "$1" + " ".repeat(lastStringLineLength));
            chunks.push(chunk);
        }
    }
    return chunks.join("");
}

/**
 * Shift all lines left by the *smallest* indentation level,
 * and remove initial newline and all trailing spaces.
 */
export default function trimIndent(strings: TemplateStringsArray, ...args: any[]) {
    // Remove initial and final newlines
    let string = populateTemplate(strings, ...args)
        .replace(/^[\r\n]/, "")
        .replace(/\r?\n *$/, "");
    const dents = string.match(/^([ \t])+/gm)
        ?.filter(s => /^\s+$/.test(s))
        ?.map(s => s.length) ?? [];
    // No dents? no change required
    if (!dents || dents.length == 0) return string;
    const minDent = Math.min(...dents);
    // The min indentation is 0, no change needed
    if (!minDent) return string;
    const re = new RegExp(`^${" ".repeat(minDent)}`, "gm");
    const dedented = string.replace(re, "");
    return dedented;
}
