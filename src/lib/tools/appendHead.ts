import { Deferred } from "evt/tools/Deferred";

export function appendHead(
    params:
        | {
              type: "css";
              href: string;
          }
        | {
              type: "javascript";
              src: string;
          },
) {
    const htmlElement = document.createElement(
        (() => {
            switch (params.type) {
                case "css":
                    return "link";
                case "javascript":
                    return "script";
            }
        })(),
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
                        "type": "text/css",
                        "rel": "stylesheet",
                        "media": "screen,print",
                    };
                case "javascript":
                    return {
                        "src": params.src,
                        "type": "text/javascript",
                    };
            }
        })(),
    );

    document.getElementsByTagName("head")[0].appendChild(htmlElement);

    return dLoaded.pr;
}
