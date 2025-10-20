import { formatChoiceMessage } from "keycloakify/login/i18n/noJsx";
import { expect, it, describe } from "vitest";

describe("formatChoiceMessage", () => {
    it("Formatting without args", () => {
        expect(formatChoiceMessage("Simple message without placeholders.")).toEqual(
            "Simple message without placeholders."
        );

        expect(formatChoiceMessage("Message with {0} simple placeholder.")).toEqual(
            "Message with {0} simple placeholder."
        );

        expect(
            formatChoiceMessage("Message with {0} and {1} simple placeholders.")
        ).toEqual("Message with {0} and {1} simple placeholders.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder."
            )
        ).toEqual("Message with multiple items choice placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0      ,     choice     , 0#     no items     |1#one item|2#multiple items} choice placeholder and spaces inside of them."
            )
        ).toEqual(
            "Message with multiple items choice placeholder and spaces inside of them."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder and nested {0} simple placeholder."
            )
        ).toEqual(
            "Message with  {0} items choice placeholder and nested {0} simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder and {1} simple placeholder."
            )
        ).toEqual(
            "Message with multiple items choice placeholder and {1} simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder with nested {0} simple placeholder and {1} simple placeholder."
            )
        ).toEqual(
            "Message with  {0} items choice placeholder with nested {0} simple placeholder and {1} simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with multiple {0, choice, 0#no items|1#one item|2#multiple items} choice placeholders: first {0, choice, 0#no items|1#one item|2#multiple items}, second {0, choice, 0#no items|1#one item|2#multiple items}."
            )
        ).toEqual(
            "Message with multiple multiple items choice placeholders: first multiple items, second multiple items."
        );
    });

    it("Formatting with invalid arguments", () => {
        expect(formatChoiceMessage("Simple message without placeholders.", [])).toEqual(
            "Simple message without placeholders."
        );

        expect(
            formatChoiceMessage("Message with {0} simple placeholder.", [undefined])
        ).toEqual("Message with {0} simple placeholder.");

        expect(
            formatChoiceMessage("Message with {0} and {1} simple placeholders.", [
                undefined,
                undefined
            ])
        ).toEqual("Message with {0} and {1} simple placeholders.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder.",
                ["text"]
            )
        ).toEqual("Message with multiple items choice placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0      ,     choice     , 0#     no items     |1#one item|2#multiple items} choice placeholder and spaces inside of them.",
                [NaN]
            )
        ).toEqual(
            "Message with multiple items choice placeholder and spaces inside of them."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder and nested {0} simple placeholder.",
                []
            )
        ).toEqual(
            "Message with  {0} items choice placeholder and nested {0} simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder and {1} simple placeholder.",
                [null, undefined]
            )
        ).toEqual("Message with no items choice placeholder and {1} simple placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder with nested {0} simple placeholder and {1} simple placeholder.",
                ["text", "more text"]
            )
        ).toEqual(
            "Message with  text items choice placeholder with nested text simple placeholder and more text simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with multiple {0, choice, 0#no items|1#one item|2#multiple items} choice placeholders: first {0, choice, 0#no items|1#one item|2#multiple items}, second {0, choice, 0#no items|1#one item|2#multiple items}.",
                []
            )
        ).toEqual(
            "Message with multiple multiple items choice placeholders: first multiple items, second multiple items."
        );
    });

    it("Formatting with valid arguments", () => {
        expect(formatChoiceMessage("Simple message without placeholders.", [])).toEqual(
            "Simple message without placeholders."
        );

        expect(formatChoiceMessage("Message with {0} simple placeholder.", [1])).toEqual(
            "Message with 1 simple placeholder."
        );

        expect(
            formatChoiceMessage("Message with {0} and {1} simple placeholders.", [2, 3])
        ).toEqual("Message with 2 and 3 simple placeholders.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder.",
                [0]
            )
        ).toEqual("Message with no items choice placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder.",
                [1]
            )
        ).toEqual("Message with one item choice placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder.",
                [2]
            )
        ).toEqual("Message with multiple items choice placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items|2<{0} items} choice placeholder.",
                [4]
            )
        ).toEqual("Message with 4 items choice placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0      ,     choice     , 0#     no items     |1#one item|2#multiple items} choice placeholder and spaces inside of them.",
                [0]
            )
        ).toEqual(
            "Message with      no items      choice placeholder and spaces inside of them."
        );

        expect(
            formatChoiceMessage(
                "Message with {0      ,     choice     , 0#     no items     |1#one item|2#multiple items} choice placeholder and spaces inside of them.",
                [1]
            )
        ).toEqual("Message with one item choice placeholder and spaces inside of them.");

        expect(
            formatChoiceMessage(
                "Message with {0      ,     choice     , 0#     no items     |1#one item|2#multiple items} choice placeholder and spaces inside of them.",
                [2]
            )
        ).toEqual(
            "Message with multiple items choice placeholder and spaces inside of them."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder and nested {0} simple placeholder.",
                [0]
            )
        ).toEqual(
            "Message with no items choice placeholder and nested 0 simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder and nested {0} simple placeholder.",
                [1]
            )
        ).toEqual(
            "Message with one item choice placeholder and nested 1 simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2< {0} items} choice placeholder and nested {0} simple placeholder.",
                [2]
            )
        ).toEqual(
            "Message with  2 items choice placeholder and nested 2 simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|4< {0} items} choice placeholder and nested {0} simple placeholder.",
                [4]
            )
        ).toEqual(
            "Message with  4 items choice placeholder and nested 4 simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder and {1} simple placeholder.",
                [0, 0]
            )
        ).toEqual("Message with no items choice placeholder and 0 simple placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder and {1} simple placeholder.",
                [1, 0]
            )
        ).toEqual("Message with one item choice placeholder and 0 simple placeholder.");

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2#multiple items} choice placeholder and {1} simple placeholder.",
                [2, 0]
            )
        ).toEqual(
            "Message with multiple items choice placeholder and 0 simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder with nested {0} simple placeholder and {1} simple placeholder.",
                [0, "more text"]
            )
        ).toEqual(
            "Message with no items choice placeholder with nested 0 simple placeholder and more text simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder with nested {0} simple placeholder and {1} simple placeholder.",
                [1, "more text"]
            )
        ).toEqual(
            "Message with one item choice placeholder with nested 1 simple placeholder and more text simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with {0, choice, 0#no items|1#one item|2# {0} items} choice placeholder with nested {0} simple placeholder and {1} simple placeholder.",
                [2, "more text"]
            )
        ).toEqual(
            "Message with  2 items choice placeholder with nested 2 simple placeholder and more text simple placeholder."
        );

        expect(
            formatChoiceMessage(
                "Message with multiple {0, choice, 0#no items|1#one item|2#multiple items} choice placeholders: first {0, choice, 0#no items|1#one item|2#multiple items}, second {0, choice, 0#no items|1#one item|2#multiple items}.",
                [0]
            )
        ).toEqual(
            "Message with multiple no items choice placeholders: first no items, second no items."
        );

        expect(
            formatChoiceMessage(
                "Message with multiple {0, choice, 0#no items|1#one item|2#multiple items} choice placeholders: first {0, choice, 0#no items|1#one item|2#multiple items}, second {0, choice, 0#no items|1#one item|2#multiple items}.",
                [1]
            )
        ).toEqual(
            "Message with multiple one item choice placeholders: first one item, second one item."
        );

        expect(
            formatChoiceMessage(
                "Message with multiple {0, choice, 0#no items|1#one item|2#multiple items} choice placeholders: first {0, choice, 0#no items|1#one item|2#multiple items}, second {0, choice, 0#no items|1#one item|2#multiple items}.",
                [2]
            )
        ).toEqual(
            "Message with multiple multiple items choice placeholders: first multiple items, second multiple items."
        );
    });
});
