import "./HTMLElement.prototype.prepend";
export declare function headInsert(
    params:
        | {
              type: "css";
              href: string;
              position: "append" | "prepend";
          }
        | {
              type: "javascript";
              src: string;
          },
): Promise<void>;
