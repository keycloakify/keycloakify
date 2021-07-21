
import { createUseGlobalState } from "powerhooks/useGlobalState";
import { getKcContext } from "../getKcContext";
import { getBestMatchAmongKcLanguageTag } from "./KcLanguageTag";
import type { StatefulEvt } from "powerhooks";
import { KcLanguageTag } from "./KcLanguageTag";


//export const { useKcLanguageTag, evtKcLanguageTag } = createUseGlobalState(
const wrap = createUseGlobalState(
    "kcLanguageTag",
    () => {


        const { kcContext } = getKcContext();

        const languageLike =
            kcContext?.locale?.current ??
            (
                typeof navigator === "undefined" ?
                    undefined :
                    navigator.language
            );

        if (languageLike === undefined) {
            return "en";
        }

        return getBestMatchAmongKcLanguageTag(languageLike);

    },
    { "persistance": "localStorage" }
);

export const { useKcLanguageTag } = wrap;

export function getEvtKcLanguage(): StatefulEvt<KcLanguageTag> {
    return wrap.evtKcLanguageTag;
}



