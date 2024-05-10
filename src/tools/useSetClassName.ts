import { useEffect } from "react";

export function useSetClassName(params: { qualifiedName: "html" | "body"; className: string | undefined }) {
    const { qualifiedName, className } = params;

    useEffect(() => {
        if (className === undefined || className === "") {
            return;
        }

        const htmlClassList = document.getElementsByTagName(qualifiedName)[0].classList;

        const tokens = className.split(" ");

        htmlClassList.add(...tokens);

        return () => {
            htmlClassList.remove(...tokens);
        };
    }, [className]);
}
