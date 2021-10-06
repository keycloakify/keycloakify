
import { kcMessages } from "../generated_kcMessages/15.0.1/login";
import { Evt } from "evt";
import { objectKeys } from "tsafe/objectKeys";

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
                    }
                };


            })()
        )
    )
);

export { kcMessages };

