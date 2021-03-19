export declare function appendHead(params: {
    type: "css";
    href: string;
} | {
    type: "javascript";
    src: string;
}): Promise<void>;
