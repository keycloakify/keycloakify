import { kcMessages as kcMessagesBase } from "../generated_kcMessages/15.0.2/login";
import { Evt } from "evt";
import { objectKeys } from "tsafe/objectKeys";

const kcMessages = {
    ...kcMessagesBase,
    "en": {
        ...kcMessagesBase["en"],
        "shouldBeEqual": "{0} should be equal to {1}",
        "shouldBeDifferent": "{0} should be different to {1}",
        "shouldMatchPattern": "Pattern should match: `/{0}/`",
        "mustBeAnInteger": "Must be an integer",
    },
    "fr": {
        ...kcMessagesBase["fr"],
        /* spell-checker: disable */
        "shouldBeEqual": "{0} doit être egale à {1}",
        "shouldBeDifferent": "{0} doit être différent de {1}",
        "shouldMatchPattern": "Dois respecter le schéma: `/{0}/`",
        "mustBeAnInteger": "Doit être un nombre entiers",
        /* spell-checker: enable */
    },
};

export const evtTermsUpdated = Evt.asNonPostable(Evt.create<void>());

(["termsText", "doAccept", "doDecline", "termsTitle"] as const).forEach(key =>
    objectKeys(kcMessages).forEach(kcLanguage =>
        Object.defineProperty(
            kcMessages[kcLanguage],
            key,
            (() => {
                let value = key === "termsText" ? "⏳" : kcMessages[kcLanguage][key];

                return {
                    "enumerable": true,
                    "get": () => value,
                    "set": (newValue: string) => {
                        value = newValue;
                        Evt.asPostable(evtTermsUpdated).post();
                    },
                };
            })(),
        ),
    ),
);

export { kcMessages };
