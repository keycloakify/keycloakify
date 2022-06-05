import { kcMessages as kcMessagesBase } from "./generated_kcMessages/15.0.2/login";

export const kcMessages = {
    ...kcMessagesBase,
    "en": {
        ...kcMessagesBase["en"],
        "termsText": "⏳",
        "shouldBeEqual": "{0} should be equal to {1}",
        "shouldBeDifferent": "{0} should be different to {1}",
        "shouldMatchPattern": "Pattern should match: `/{0}/`",
        "mustBeAnInteger": "Must be an integer",
        "notAValidOption": "Not a valid option",
    },
    "fr": {
        ...kcMessagesBase["fr"],
        /* spell-checker: disable */
        "shouldBeEqual": "{0} doit être egale à {1}",
        "shouldBeDifferent": "{0} doit être différent de {1}",
        "shouldMatchPattern": "Dois respecter le schéma: `/{0}/`",
        "mustBeAnInteger": "Doit être un nombre entiers",
        "notAValidOption": "N'est pas une option valide",
        /* spell-checker: enable */
    },
};
