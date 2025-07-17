import { z } from "zod";
import { assert, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";

export type ParsedRealmJson = {
    realm: string;
    loginTheme?: string;
    accountTheme?: string;
    adminTheme?: string;
    emailTheme?: string;
    sslRequired?: string;
    eventsListeners: string[];
    users: {
        id: string;
        email: string;
        username: string;
        credentials: {
            type: string /* "password" or something else */;
        }[];
        clientRoles?: Record<string, string[]>;
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
        protocolMappers?: {
            id: string;
            name: string;
            protocol: string; // "openid-connect" or something else
            protocolMapper: string; // "oidc-hardcoded-claim-mapper" or something else
            consentRequired: boolean;
            config?: Record<string, string>;
        }[];
    }[];
};

export const zParsedRealmJson = (() => {
    type TargetType = ParsedRealmJson;

    const zTargetType = z.object({
        realm: z.string(),
        loginTheme: z.string().optional(),
        accountTheme: z.string().optional(),
        adminTheme: z.string().optional(),
        emailTheme: z.string().optional(),
        sslRequired: z.string().optional(),
        eventsListeners: z.array(z.string()),
        users: z.array(
            z.object({
                id: z.string(),
                email: z.string(),
                username: z.string(),
                credentials: z.array(
                    z.object({
                        type: z.string()
                    })
                ),
                clientRoles: z.record(z.array(z.string())).optional()
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
                protocolMappers: z
                    .array(
                        z.object({
                            id: z.string(),
                            name: z.string(),
                            protocol: z.string(),
                            protocolMapper: z.string(),
                            consentRequired: z.boolean(),
                            config: z.record(z.string()).optional()
                        })
                    )
                    .optional()
            })
        )
    });

    type InferredType = z.infer<typeof zTargetType>;

    assert<Equals<TargetType, InferredType>>;

    return id<z.ZodType<TargetType>>(zTargetType);
})();
