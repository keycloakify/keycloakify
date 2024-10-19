import { assert } from "keycloakify/tools/assert";
let cleanup: (() => void) | undefined;
const handledElements = new WeakSet<HTMLElement>();
const KC_NUMBER_UNFORMAT = "kcNumberUnFormat";
const SELECTOR = `input[data-${KC_NUMBER_UNFORMAT}]`;

export function unFormatNumberOnSubmit() {
    cleanup?.();

    const handleElement = (element: HTMLInputElement) => {
        if (handledElements.has(element)) {
            return;
        }

        const form = element.closest("form");

        if (form === null) {
            return;
        }

        form.addEventListener("submit", () => {
            const rawFormat = element.getAttribute(`data-${KC_NUMBER_UNFORMAT}`);
            if (rawFormat) {
                element.value = formatNumber(element.value, rawFormat);
            }
        });

        handledElements.add(element);
    };

    document.querySelectorAll(SELECTOR).forEach(element => {
        assert(element instanceof HTMLInputElement);
        handleElement(element);
    });

    const observer = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = (node as HTMLElement).querySelector(SELECTOR);
                        if (element !== null) {
                            assert(element instanceof HTMLInputElement);
                            handleElement(element);
                        }
                    }
                });
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    cleanup = () => observer.disconnect();
}

// NOTE: Keycloak code
const formatNumber = (input: string, format: string) => {
    if (!input) {
        return "";
    }

    // array holding the patterns for the number of expected digits in each part
    const digitPattern = format.match(/{\d+}/g);

    if (!digitPattern) {
        return "";
    }

    // calculate the maximum size of the given pattern based on the sum of the expected digits
    const maxSize = digitPattern.reduce(
        (total, p) => total + parseInt(p.replace("{", "").replace("}", "")),
        0
    );

    // keep only digits
    let rawValue = input.replace(/\D+/g, "");

    // make sure the value is a number
    //@ts-expect-error
    if (parseInt(rawValue) != rawValue) {
        return "";
    }

    // make sure the number of digits does not exceed the maximum size
    if (rawValue.length > maxSize) {
        rawValue = rawValue.substring(0, maxSize);
    }

    // build the regex based based on the expected digits in each part
    const formatter = digitPattern.reduce((result, p) => result + `(\\d${p})`, "^");

    // if the current digits match the pattern we have each group of digits in an array
    let digits = new RegExp(formatter).exec(rawValue);

    // no match, return the raw value without any format
    if (!digits) {
        return input;
    }

    let result = format;

    // finally format the current digits accordingly to the given format
    for (let i = 0; i < digitPattern.length; i++) {
        result = result.replace(digitPattern[i], digits[i + 1]);
    }

    return result;
};
