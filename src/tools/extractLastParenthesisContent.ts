/**
 * "Hello (world)" => "world"
 * "Hello (world) (foo)" => "foo"
 * "Hello (world (foo))" => "world (foo)"
 */
export function extractLastParenthesisContent(str: string): string | undefined {
    const chars: string[] = [];

    for (const char of str) {
        chars.push(char);
    }

    const extractedChars: string[] = [];
    let openingCount = 0;

    loop_through_char: for (let i = chars.length - 1; i >= 0; i--) {
        const char = chars[i];

        if (i === chars.length - 1) {
            if (char !== ")") {
                return undefined;
            }

            continue;
        }

        switch (char) {
            case ")":
                openingCount++;
                break;
            case "(":
                if (openingCount === 0) {
                    return extractedChars.join("");
                }
                openingCount--;
                break;
        }

        extractedChars.unshift(char);
    }

    return undefined;
}
