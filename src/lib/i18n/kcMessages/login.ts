
import { kcMessages } from "../generated_kcMessages/login";
import { Evt } from "evt";
import { objectKeys } from "evt/tools/typeSafety/objectKeys";

export const evtTermsUpdated = Evt.asNonPostable(Evt.create<void>());

objectKeys(kcMessages).forEach(kcLanguage =>
    Object.defineProperty(
        kcMessages[kcLanguage],
        "termsText",
        (() => {

            let value = kcMessages[kcLanguage].termsText;

            return {
                "enumerable": true,
                "get": () => value,
                "set": (newValue: string) => {

                    Evt.asPostable(evtTermsUpdated).post();

                    value = newValue;
                }
            };


        })()
    )
);

export { kcMessages };

