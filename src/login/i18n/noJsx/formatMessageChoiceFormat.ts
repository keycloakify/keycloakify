/**
 * Finds the index of the matching closing brace for the opening brace at the given start index.
 * @param message whole message string
 * @param start index of the character after the opening brace
 */
function findMatchingBrace(message: string, start: number): number {
    let depth = 1;
    let i = start;
    while (i < message.length && depth > 0) {
        if (message[i] === "{") depth++;
        else if (message[i] === "}") depth--;
        i++;
    }
    return depth === 0 ? i : -1;
}

/**
 * Splits the inner choice options by the "|" character.
 * @param inner Inner string containing choice options
 * @returns Array of choice options
 */
function splitChoiceOptions(inner: string): string[] {
    const options = [];
    let cur = "";
    let nested = 0;
    for (let ch of inner) {
        if (ch === "{") nested++;
        else if (ch === "}") nested--;
        if (ch === "|" && nested === 0) {
            options.push(cur);
            cur = "";
        } else {
            cur += ch;
        }
    }
    options.push(cur);
    return options;
}

/**
 * Chooses the appropriate option text based on the provided value.
 * @param options Array of choice options
 * @param value The value to match against the options
 * @returns The chosen option text
 */
function chooseOption(options: string[], value: number | undefined): string {
    for (const opt of options) {
        const optMatch = opt.match(
            /^\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*(#|<)([\s\S]*)$/
        );
        if (!optMatch) continue;
        const limit = Number(optMatch[1]);
        const op = optMatch[2];
        const text = optMatch[3];
        if (value === undefined) {
            continue;
        }
        if ((op === "#" && value <= limit) || (op === "<" && value > limit)) {
            return text;
        }
    }
    // fallback to last option's text if nothing matched
    const lastOpt = options[options.length - 1] || "";
    return lastOpt.replace(/^\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*(#|<)/, "");
}

/**
 * Replaces simple placeholders in the message with the corresponding arguments.
 * @param result The current result string
 * @param message The original message string
 * @param args The arguments to replace placeholders with
 * @param startIndex The starting index for replacement
 * @returns The updated result string
 */
function replaceSimplePlaceholders(
    result: string,
    message: string,
    args: any[] | undefined,
    startIndex: number | undefined
): string {
    const simplePlaceholderStartIndex = message
        .match(/{[0-9]+}/g)
        ?.map(g => g.match(/{([0-9]+)}/)![1])
        .map(indexStr => parseInt(indexStr))
        .sort((a, b) => a - b)[0];

    if (startIndex === undefined || startIndex > simplePlaceholderStartIndex!) {
        startIndex = simplePlaceholderStartIndex!;
    }

    args?.forEach((arg, i) => {
        if (arg === undefined || startIndex === undefined) {
            return;
        }
        result = result.replace(new RegExp(`\\{${i + startIndex}\\}`, "g"), arg);
    });
    return result;
}

/**
 * Formats a message by replacing placeholders and choice format with the corresponding arguments.
 * @param message The original message string
 * @param args The arguments to replace placeholders with
 * @returns The formatted message string
 */
export function formatChoiceMessage(message: string, args?: any[]): string {
    let result = "";
    let startIndex: number | undefined;
    let lastIndex = 0;
    const openerRegex = /\{\s*(\d+)\s*,\s*choice\s*,/g;
    let m;

    while ((m = openerRegex.exec(message)) !== null) {
        const start = m.index;
        const argIndex = Number(m[1]);
        if (startIndex === undefined || startIndex > argIndex) {
            startIndex = argIndex;
        }
        result += message.slice(lastIndex, start);

        const innerStart = start + m[0].length;
        const end = findMatchingBrace(message, innerStart);
        if (end === -1) {
            result += message.slice(start);
            lastIndex = message.length;
            break;
        }
        const inner = message.slice(innerStart, end - 1);
        const options = splitChoiceOptions(inner);
        const value = args ? Number(args[argIndex]) : undefined;
        const chosenText = chooseOption(options, value);
        result += chosenText;
        lastIndex = end;
        openerRegex.lastIndex = lastIndex;
    }

    result += message.slice(lastIndex);
    result = replaceSimplePlaceholders(result, message, args, startIndex);
    return result;
}
