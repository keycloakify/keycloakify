export type ExtractAfterStartingWith<
    Prefix extends string,
    StrEnum
> = StrEnum extends `${Prefix}${infer U}` ? U : never;
