// Convert a JavaScript string to UTF-16 encoding
function toUTF16(codePoint: number): string {
    if (codePoint <= 0xffff) {
        // BMP character
        return "\\u" + codePoint.toString(16).padStart(4, "0");
    } else {
        // Non-BMP character
        codePoint -= 0x10000;
        let highSurrogate = (codePoint >> 10) + 0xd800;
        let lowSurrogate = (codePoint % 0x400) + 0xdc00;
        return (
            "\\u" +
            highSurrogate.toString(16).padStart(4, "0") +
            "\\u" +
            lowSurrogate.toString(16).padStart(4, "0")
        );
    }
}

// Escapes special characters for use in a .properties file
export function escapeStringForPropertiesFile(str: string): string {
    let escapedStr = "";
    for (const char of [...str]) {
        const codePoint = char.codePointAt(0);
        if (!codePoint) continue;

        switch (char) {
            case "\n":
                escapedStr += "\\n";
                break;
            case "\r":
                escapedStr += "\\r";
                break;
            case "\t":
                escapedStr += "\\t";
                break;
            case "\\":
                escapedStr += "\\\\";
                break;
            case ":":
                escapedStr += "\\:";
                break;
            case "=":
                escapedStr += "\\=";
                break;
            case "#":
                escapedStr += "\\#";
                break;
            case "!":
                escapedStr += "\\!";
                break;
            case "'":
                escapedStr += "''";
                break;
            default:
                if (codePoint > 0x7f) {
                    escapedStr += toUTF16(codePoint); // Non-ASCII characters
                } else {
                    escapedStr += char; // ASCII character needs no escape
                }
        }
    }
    return escapedStr;
}
