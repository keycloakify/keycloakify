import { useState, useEffect } from "react";
import { fallbackLanguageTag } from "keycloakify/login/i18n";
import { assert } from "tsafe/assert";
import { createStatefulObservable, useRerenderOnChange } from "keycloakify/tools/StatefulObservable";
import { useOnFistMount } from "keycloakify/tools/useOnFirstMount";
import { KcContext } from "../KcContext";
import type { Options as ReactMarkdownOptions } from "../../tools/react-markdown";

const obs = createStatefulObservable<
    | {
          ReactMarkdown: (props: Readonly<ReactMarkdownOptions>) => JSX.Element;
          termsMarkdown: string;
      }
    | undefined
>(() => undefined);

export type KcContextLike_useDownloadTerms = {
    pageId: string;
    locale?: {
        currentLanguageTag: string;
    };
    termsAcceptanceRequired?: boolean;
};

assert<KcContext extends KcContextLike_useDownloadTerms ? true : false>();

/** Allow to avoid bundling the terms and download it on demand*/
export function useDownloadTerms(params: {
    kcContext: KcContextLike_useDownloadTerms;
    downloadTermsMarkdown: (params: { currentLanguageTag: string }) => Promise<{ termsMarkdown: string; termsLanguageTag: string | undefined }>;
}) {
    const { kcContext, downloadTermsMarkdown } = params;

    useOnFistMount(async () => {
        if (kcContext.pageId === "terms.ftl" || kcContext.termsAcceptanceRequired) {
            const currentLanguageTag = kcContext.locale?.currentLanguageTag ?? fallbackLanguageTag;

            const [ReactMarkdown_base, { termsMarkdown, termsLanguageTag }] = await Promise.all([
                import("../../tools/react-markdown").then(_ => _.default),
                downloadTermsMarkdown({ currentLanguageTag })
            ] as const);

            const htmlLang = termsLanguageTag !== currentLanguageTag ? termsLanguageTag : undefined;

            const ReactMarkdown: (props: Readonly<ReactMarkdownOptions>) => JSX.Element =
                htmlLang === undefined
                    ? ReactMarkdown_base
                    : props => {
                          const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);

                          useEffect(() => {
                              if (anchor === null) {
                                  return;
                              }

                              const parent = anchor.parentElement;

                              assert(parent !== null);

                              parent.setAttribute("lang", htmlLang);

                              anchor.remove();
                          }, [anchor]);

                          return (
                              <>
                                  <ReactMarkdown_base {...props} />
                                  <div ref={setAnchor} style={{ display: "none" }} aria-hidden />
                              </>
                          );
                      };

            obs.current = { ReactMarkdown, termsMarkdown };
        }
    });
}

export function useTermsMarkdown() {
    useRerenderOnChange(obs);

    if (obs.current === undefined) {
        return { isDownloadComplete: false as const };
    }

    const { ReactMarkdown, termsMarkdown } = obs.current;

    return { isDownloadComplete: true, ReactMarkdown, termsMarkdown };
}
