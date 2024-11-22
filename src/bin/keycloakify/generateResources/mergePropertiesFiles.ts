import propertiesParser from "properties-parser";
import fs from "fs";

export function mergePropertiesFiles(...files: string[]): string {
    const messages = files.reduce(
        (acc, filePath) => {
            const messages = propertiesParser.parse(
                fs.readFileSync(filePath).toString("utf8")
            );

            return {
                ...acc,
                ...messages
            };
        },
        {} as Record<string, string>
    );

    const editor = propertiesParser.createEditor();

    Object.entries(messages).forEach(([key, value]) => {
        editor.set(key, value);
    });

    return editor.toString();
}
