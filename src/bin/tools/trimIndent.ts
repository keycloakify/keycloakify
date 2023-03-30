/**
 * Concatenate the string fragments and interpolated values
 * to get a single string.
 */
function populateTemplate(strings: TemplateStringsArray, ...args: unknown[]) {
    const chunks = [];
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

function trimIndentPrivate(removeEmptyLeadingAndTrailingLines: boolean, strings: TemplateStringsArray, ...args: any[]) {
    // Remove initial and final newlines
    let string = populateTemplate(strings, ...args);
    if (removeEmptyLeadingAndTrailingLines) {
        string = string.replace(/^[\r\n]/, "").replace(/[^\S\r\n]*[\r\n]$/, "");
    }
    const dents = string.match(/^([ \t])+/gm)?.map(s => s.length) ?? [];
    // No dents? no change required
    if (!dents || dents.length == 0) return string;
    const minDent = Math.min(...dents);
    // The min indentation is 0, no change needed
    if (!minDent) return string;
    const re = new RegExp(`^${" ".repeat(minDent)}`, "gm");
    const dedented = string.replace(re, "");
    return dedented;
}

/**
 * Shift all lines left by the *smallest* indentation level,
 * and remove initial newline and all trailing spaces.
 */
export default function trimIndent(strings: TemplateStringsArray, ...args: unknown[]) {
    return trimIndentPrivate(true, strings, ...args);
}

/**
 * Shift all lines left by the *smallest* indentation level,
 * and _keep_ initial newline and all trailing spaces.
 */
trimIndent.keepLeadingAndTrailingNewlines = function (strings: TemplateStringsArray, ...args: unknown[]) {
    return trimIndentPrivate(false, strings, ...args);
};
