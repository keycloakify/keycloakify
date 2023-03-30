import { AndByDiscriminatingKey } from "keycloakify/tools/AndByDiscriminatingKey";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { it, describe } from "vitest";

// These test case names are intentionally vague, because I'm not sure what each are testing individually
describe("AndByDiscriminatingKey", () => {
    it("Test Case 1", () => {
        type Base = { pageId: "a"; onlyA: string } | { pageId: "b"; onlyB: string } | { pageId: "only base"; onlyBase: string };

        type Extension = { pageId: "a"; onlyExtA: string } | { pageId: "b"; onlyExtB: string } | { pageId: "only ext"; onlyExt: string };

        type Got = AndByDiscriminatingKey<"pageId", Extension, Base>;

        type Expected =
            | { pageId: "a"; onlyA: string; onlyExtA: string }
            | { pageId: "b"; onlyB: string; onlyExtB: string }
            | { pageId: "only base"; onlyBase: string }
            | { pageId: "only ext"; onlyExt: string };

        assert<Equals<Got, Expected>>();

        const x: Got = {} as any;

        if (x.pageId === "a") {
            x.onlyA;
            x.onlyExtA;

            //@ts-expect-error
            x.onlyB;

            //@ts-expect-error
            x.onlyBase;

            //@ts-expect-error
            x.onlyExt;
        }

        if (x.pageId === "b") {
            x.onlyB;
            x.onlyExtB;

            //@ts-expect-error
            x.onlyA;

            //@ts-expect-error
            x.onlyBase;

            //@ts-expect-error
            x.onlyExt;
        }

        if (x.pageId === "only base") {
            x.onlyBase;

            //@ts-expect-error
            x.onlyA;

            //@ts-expect-error
            x.onlyB;

            //@ts-expect-error
            x.onlyExt;
        }

        if (x.pageId === "only ext") {
            x.onlyExt;

            //@ts-expect-error
            x.onlyA;

            //@ts-expect-error
            x.onlyB;

            //@ts-expect-error
            x.onlyBase;
        }
    });
    it("Test Case 2", () => {
        type Base = { pageId: "a"; onlyA: string } | { pageId: "b"; onlyB: string } | { pageId: "only base"; onlyBase: string };

        type Extension = { pageId: "only ext"; onlyExt: string };

        type Got = AndByDiscriminatingKey<"pageId", Extension, Base>;

        type Expected =
            | { pageId: "a"; onlyA: string }
            | { pageId: "b"; onlyB: string }
            | { pageId: "only base"; onlyBase: string }
            | { pageId: "only ext"; onlyExt: string };

        assert<Equals<Got, Expected>>();
    });
});
