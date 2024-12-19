import { z } from "zod";
import { same } from "evt/tools/inDepth/same";
import { assert, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";

export type Stringifyable =
    | StringifyableAtomic
    | StringifyableObject
    | StringifyableArray;

export type StringifyableAtomic = string | number | boolean | null;

// NOTE: Use Record<string, Stringifyable>
interface StringifyableObject {
    [key: string]: Stringifyable;
}

// NOTE: Use Stringifyable[]
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StringifyableArray extends Array<Stringifyable> {}

export const zStringifyableAtomic = (() => {
    type TargetType = StringifyableAtomic;

    const zTargetType = z.union([z.string(), z.number(), z.boolean(), z.null()]);

    assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

    return id<z.ZodType<TargetType>>(zTargetType);
})();

export const zStringifyable: z.ZodType<Stringifyable> = z
    .any()
    .superRefine((val, ctx) => {
        const isStringifyable = same(JSON.parse(JSON.stringify(val)), val);
        if (!isStringifyable) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Not stringifyable"
            });
        }
    });

export function getIsAtomic(
    stringifyable: Stringifyable
): stringifyable is StringifyableAtomic {
    return (
        ["string", "number", "boolean"].includes(typeof stringifyable) ||
        stringifyable === null
    );
}

export const { getValueAtPath } = (() => {
    function getValueAtPath_rec(
        stringifyable: Stringifyable,
        path: (string | number)[]
    ): Stringifyable | undefined {
        if (path.length === 0) {
            return stringifyable;
        }

        if (getIsAtomic(stringifyable)) {
            return undefined;
        }

        const [first, ...rest] = path;

        let dereferenced: Stringifyable | undefined;

        if (stringifyable instanceof Array) {
            if (typeof first !== "number") {
                return undefined;
            }

            dereferenced = stringifyable[first];
        } else {
            if (typeof first !== "string") {
                return undefined;
            }

            dereferenced = stringifyable[first];
        }

        if (dereferenced === undefined) {
            return undefined;
        }

        return getValueAtPath_rec(dereferenced, rest);
    }

    function getValueAtPath(
        stringifyableObjectOrArray: Record<string, Stringifyable> | Stringifyable[],
        path: (string | number)[]
    ): Stringifyable | undefined {
        return getValueAtPath_rec(stringifyableObjectOrArray, path);
    }

    return { getValueAtPath };
})();
