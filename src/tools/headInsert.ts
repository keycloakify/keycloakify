import "./HTMLElement.prototype.prepend";
import { Deferred } from "evt/tools/Deferred";

export function headInsert(
    params:
        | {
              type: "css";
              href: string;
              position: "append" | "prepend";
          }
        | {
              type: "javascript";
              isModule: boolean;
              source:
                  | {
                        type: "url";
                        src: string;
                    }
                  | {
                        type: "inline";
                        code: string;
                    };
          }
): { remove: () => void; prLoaded: Promise<void> } {
    const htmlElement = document.createElement(
        (() => {
            switch (params.type) {
                case "css":
                    return "link";
                case "javascript":
                    return "script";
            }
        })()
    );

    const dLoaded = new Deferred<void>();

    htmlElement.addEventListener("load", () => dLoaded.resolve());

    Object.assign(
        htmlElement,
        (() => {
            switch (params.type) {
                case "css":
                    return {
                        "href": params.href,
                        "rel": "stylesheet"
                    };
                case "javascript":
                    return {
                        ...(() => {
                            switch (params.source.type) {
                                case "inline":
                                    return { "textContent": params.source.code };
                                case "url":
                                    return { "src": params.source.src };
                            }
                        })(),
                        "type": params.isModule ? "module" : "text/javascript"
                    };
            }
        })()
    );

    document.getElementsByTagName("head")[0][
        (() => {
            switch (params.type) {
                case "javascript":
                    return "appendChild";
                case "css":
                    return (() => {
                        switch (params.position) {
                            case "append":
                                return "appendChild";
                            case "prepend":
                                return "prepend";
                        }
                    })();
            }
        })()
    ](htmlElement);

    return {
        "prLoaded": dLoaded.pr,
        "remove": () => htmlElement.remove()
    };
}
