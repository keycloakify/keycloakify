import { z } from "zod";
import { assert, type Equals } from "tsafe/assert";
import { is } from "tsafe/is";
import { id } from "tsafe/id";
import * as fs from "fs";

export type ParsedRealmJson = {
    realm: string;
    loginTheme?: string;
    accountTheme?: string;
    adminTheme?: string;
    emailTheme?: string;
    eventsListeners: string[];
    users: {
        id: string;
        email: string;
        username: string;
        attributes: Record<string, unknown>;
        credentials: {
            type: string /* "password" or something else */;
        }[];
        clientRoles: Record<string, string[]>;
    }[];
    roles: {
        client: Record<
            string,
            {
                name: string;
                containerId: string; // client id
            }[]
        >;
    };
    clients: {
        id: string;
        clientId: string; // example: realm-management
        baseUrl?: string;
        redirectUris?: string[];
        webOrigins?: string[];
        attributes?: {
            "post.logout.redirect.uris"?: string;
        };
        protocol?: string;
        protocolMappers?: unknown[];
    }[];
};

const zParsedRealmJson = (() => {
    type TargetType = ParsedRealmJson;

    const zTargetType = z.object({
        realm: z.string(),
        loginTheme: z.string().optional(),
        accountTheme: z.string().optional(),
        adminTheme: z.string().optional(),
        emailTheme: z.string().optional(),
        eventsListeners: z.array(z.string()),
        users: z.array(
            z.object({
                id: z.string(),
                email: z.string(),
                username: z.string(),
                attributes: z.record(z.unknown()),
                credentials: z.array(
                    z.object({
                        type: z.string()
                    })
                ),
                clientRoles: z.record(z.array(z.string()))
            })
        ),
        roles: z.object({
            client: z.record(
                z.array(
                    z.object({
                        name: z.string(),
                        containerId: z.string()
                    })
                )
            )
        }),
        clients: z.array(
            z.object({
                id: z.string(),
                clientId: z.string(),
                baseUrl: z.string().optional(),
                redirectUris: z.array(z.string()).optional(),
                webOrigins: z.array(z.string()).optional(),
                attributes: z
                    .object({
                        "post.logout.redirect.uris": z.string().optional()
                    })
                    .optional(),
                protocol: z.string().optional(),
                protocolMappers: z.array(z.unknown()).optional()
            })
        )
    });

    type InferredType = z.infer<typeof zTargetType>;

    assert<Equals<TargetType, InferredType>>;

    return id<z.ZodType<TargetType>>(zTargetType);
})();

export function readRealmJsonFile(params: {
    realmJsonFilePath: string;
}): ParsedRealmJson {
    const { realmJsonFilePath } = params;

    const parsedRealmJson = JSON.parse(
        fs.readFileSync(realmJsonFilePath).toString("utf8")
    ) as unknown;

    zParsedRealmJson.parse(parsedRealmJson);

    assert(is<ParsedRealmJson>(parsedRealmJson));

    return parsedRealmJson;
}
