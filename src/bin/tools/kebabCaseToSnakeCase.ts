import { capitalize } from "tsafe/capitalize";

export function kebabCaseToCamelCase(kebabCaseString: string): string {
    const [first, ...rest] = kebabCaseString.split("-");

    return [first, ...rest.map(capitalize)].join("");
}
