export function tailVisualLines(s: string, n: number) {
    // Strip ANSI to avoid weird wraps (optional)
    const stripAnsi = (x: string) =>
        x.replace(
            // minimal ANSI stripper
            // eslint-disable-next-line no-control-regex
            /\u001b\[[0-9;]*m/g,
            ""
        );

    // Convert CR “redraw” runs into newlines,
    // then split on either \n or \r that aren’t part of \r\n pairs.
    const normalized = stripAnsi(s)
        // If a carriage return is used to redraw the line, turn it into a newline
        .replace(/\r(?!\n)/g, "\n");

    const lines = normalized.split(/\r?\n/);
    return lines.slice(-n).join("\n");
}
