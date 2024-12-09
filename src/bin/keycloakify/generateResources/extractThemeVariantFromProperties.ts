import propertiesParser from "properties-parser";

export function extractThemeVariantFromProperties(
    propertiesContent: string,
    themeName: string,
    themes: string[]
) {
    const properties = propertiesParser.parse(propertiesContent);

    const editor = Object.entries(properties).reduce((acc, [key, value]) => {
        if (key.startsWith(themeName + ".")) {
            acc.set(key.replace(themeName + ".", ""), value);
        } else if (!themes.some(themeName => key.startsWith(themeName + "."))) {
            acc.set(key, value);
        }

        return acc;
    }, propertiesParser.createEditor());

    return editor.toString();
}
