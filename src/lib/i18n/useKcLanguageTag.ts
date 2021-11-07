import { createUseGlobalState } from "powerhooks/useGlobalState";
import { getKcContextFromWindow } from "../getKcContext/getKcContextFromWindow";
import { getBestMatchAmongKcLanguageTag } from "./KcLanguageTag";
import type { StatefulEvt } from "powerhooks";
import { KcLanguageTag } from "./KcLanguageTag";

//export const { useKcLanguageTag, evtKcLanguageTag } = createUseGlobalState(
const wrap = createUseGlobalState(
    "kcLanguageTag",
    () => {
        const kcContext = getKcContextFromWindow();

        const languageLike = kcContext?.locale?.current ?? (typeof navigator === "undefined" ? undefined : navigator.language);

        if (languageLike === undefined) {
            return "en";
        }

        return getBestMatchAmongKcLanguageTag(languageLike);
    },
    { "persistance": "localStorage" },
);

export const { useKcLanguageTag } = wrap;

export function getEvtKcLanguage(): StatefulEvt<KcLanguageTag> {
    return wrap.evtKcLanguageTag;
}
