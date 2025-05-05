import type { ReactElement } from "react";

export namespace JSX {
    export interface Element extends ReactElement<any, any> {}
}

export type JSXElement = JSX.Element;
