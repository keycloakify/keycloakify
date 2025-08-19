import { assert } from "tsafe/assert";
import type { ParsedRealmJson } from "./ParsedRealmJson";
import { getDefaultConfig } from "./defaultConfig";
import { TEST_APP_URL, type ThemeType, THEME_TYPES } from "../../shared/constants";
import { sameFactory } from "evt/tools/inDepth/same";

export function prepareRealmConfig(params: {
    parsedRealmJson: ParsedRealmJson;
    keycloakMajorVersionNumber: number;
    parsedKeycloakThemesJsonEntry: { name: string; types: (ThemeType | "email")[] };
}): {
    realmName: string;
    clientName: string;
    username: string;
} {
    const { parsedRealmJson, keycloakMajorVersionNumber, parsedKeycloakThemesJsonEntry } =
        params;

    const { username } = addOrEditTestUser({
        parsedRealmJson,
        keycloakMajorVersionNumber
    });

    const { clientId } = addOrEditClient({
        parsedRealmJson,
        keycloakMajorVersionNumber
    });

    editAccountConsoleAndSecurityAdminConsole({ parsedRealmJson });

    enableCustomThemes({
        parsedRealmJson,
        parsedKeycloakThemesJsonEntry
    });

    enable_custom_events_listeners: {
        const name = "keycloakify-logging";

        if (parsedRealmJson.eventsListeners.includes(name)) {
            break enable_custom_events_listeners;
        }

        parsedRealmJson.eventsListeners.push(name);

        parsedRealmJson.eventsListeners.sort();
    }

    parsedRealmJson.sslRequired = "none";

    return {
        realmName: parsedRealmJson.realm,
        clientName: clientId,
        username
    };
}

function enableCustomThemes(params: {
    parsedRealmJson: ParsedRealmJson;
    parsedKeycloakThemesJsonEntry: { name: string; types: (ThemeType | "email")[] };
}) {
    const { parsedRealmJson, parsedKeycloakThemesJsonEntry } = params;

    for (const themeType of [...THEME_TYPES, "email"] as const) {
        parsedRealmJson[`${themeType}Theme` as const] =
            !parsedKeycloakThemesJsonEntry.types.includes(themeType)
                ? ""
                : parsedKeycloakThemesJsonEntry.name;
    }
}

function addOrEditTestUser(params: {
    parsedRealmJson: ParsedRealmJson;
    keycloakMajorVersionNumber: number;
}): { username: string } {
    const { parsedRealmJson, keycloakMajorVersionNumber } = params;

    const parsedRealmJson_default = getDefaultConfig({ keycloakMajorVersionNumber });

    const [defaultUser_default] = parsedRealmJson_default.users;

    assert(defaultUser_default !== undefined);

    const defaultUser_preexisting = parsedRealmJson.users.find(
        user => user.username === defaultUser_default.username
    );

    const newUser = structuredClone(
        defaultUser_preexisting ??
            (() => {
                const firstUser = parsedRealmJson.users[0];

                if (firstUser === undefined) {
                    return undefined;
                }

                const firstUserCopy = structuredClone(firstUser);

                firstUserCopy.id = defaultUser_default.id;

                return firstUserCopy;
            })() ??
            defaultUser_default
    );

    newUser.username = defaultUser_default.username;

    delete_existing_password_credential_if_any: {
        const i = newUser.credentials.findIndex(
            credential => credential.type === "password"
        );

        if (i === -1) {
            break delete_existing_password_credential_if_any;
        }

        newUser.credentials.splice(i, 1);
    }

    {
        const credential = defaultUser_default.credentials.find(
            credential => credential.type === "password"
        );

        assert(credential !== undefined);

        newUser.credentials.push(credential);
    }

    {
        const nameByClientId = Object.fromEntries(
            parsedRealmJson.clients.map(client => [client.id, client.clientId] as const)
        );

        const newClientRoles: NonNullable<
            ParsedRealmJson["users"][number]["clientRoles"]
        > = {};

        for (const clientRole of Object.values(parsedRealmJson.roles.client).flat()) {
            const clientName = nameByClientId[clientRole.containerId];

            assert(clientName !== undefined);

            (newClientRoles[clientName] ??= []).push(clientRole.name);
        }

        const { same: sameSet } = sameFactory({
            takeIntoAccountArraysOrdering: false
        });

        for (const [clientName, roles] of Object.entries(newClientRoles)) {
            keep_previous_ordering_if_possible: {
                const roles_previous = newUser.clientRoles?.[clientName];

                if (roles_previous === undefined) {
                    break keep_previous_ordering_if_possible;
                }

                if (!sameSet(roles_previous, roles)) {
                    break keep_previous_ordering_if_possible;
                }

                continue;
            }

            (newUser.clientRoles ??= {})[clientName] = roles;
        }
    }

    if (defaultUser_preexisting === undefined) {
        parsedRealmJson.users.push(newUser);
    } else {
        const i = parsedRealmJson.users.indexOf(defaultUser_preexisting);
        assert(i !== -1);
        parsedRealmJson.users[i] = newUser;
    }

    return { username: newUser.username };
}

function addOrEditClient(params: {
    parsedRealmJson: ParsedRealmJson;
    keycloakMajorVersionNumber: number;
}): { clientId: string } {
    const { parsedRealmJson, keycloakMajorVersionNumber } = params;

    const parsedRealmJson_default = getDefaultConfig({ keycloakMajorVersionNumber });

    const testClient_default = (() => {
        const clients = parsedRealmJson_default.clients.filter(client => {
            return JSON.stringify(client).includes(TEST_APP_URL);
        });

        assert(clients.length === 1);

        return clients[0];
    })();

    const clientIds_builtIn = parsedRealmJson_default.clients
        .map(client => client.clientId)
        .filter(clientId => clientId !== testClient_default.clientId);

    const testClient_preexisting = (() => {
        const clients = parsedRealmJson.clients
            .filter(client => !clientIds_builtIn.includes(client.clientId))
            .filter(client => client.protocol === "openid-connect");

        {
            const client = clients.find(
                client => client.clientId === testClient_default.clientId
            );

            if (client !== undefined) {
                return client;
            }
        }

        {
            const client = clients.find(
                client =>
                    client.redirectUris?.find(redirectUri =>
                        redirectUri.startsWith(TEST_APP_URL)
                    ) !== undefined
            );

            if (client !== undefined) {
                return client;
            }
        }

        const [client] = clients;

        if (client === undefined) {
            return undefined;
        }

        return client;
    })();

    let testClient: typeof testClient_default;

    if (testClient_preexisting !== undefined) {
        testClient = testClient_preexisting;
    } else {
        testClient = structuredClone(testClient_default);
        delete testClient.protocolMappers;
        parsedRealmJson.clients.push(testClient);
    }

    testClient.redirectUris = [
        `${TEST_APP_URL}/*`,
        "http://localhost*",
        "http://127.0.0.1*"
    ]
        .sort()
        .reverse();

    (testClient.attributes ??= {})["post.logout.redirect.uris"] = "+";

    testClient.webOrigins = ["*"];

    return { clientId: testClient.clientId };
}

function editAccountConsoleAndSecurityAdminConsole(params: {
    parsedRealmJson: ParsedRealmJson;
}) {
    const { parsedRealmJson } = params;

    for (const clientId of ["account-console", "security-admin-console"] as const) {
        const client = parsedRealmJson.clients.find(
            client => client.clientId === clientId
        );

        assert(client !== undefined);

        {
            const arr = (client.redirectUris ??= []);

            for (const value of ["http://localhost*", "http://127.0.0.1*"]) {
                if (!arr.includes(value)) {
                    arr.push(value);
                }
            }

            client.redirectUris?.sort().reverse();
        }

        (client.attributes ??= {})["post.logout.redirect.uris"] = "+";

        client.webOrigins = ["*"];

        admin_specific: {
            if (clientId !== "security-admin-console") {
                break admin_specific;
            }

            const protocolMapper_preexisting = client.protocolMappers?.find(
                protocolMapper => {
                    if (protocolMapper.protocolMapper !== "oidc-hardcoded-claim-mapper") {
                        return false;
                    }

                    if (protocolMapper.protocol !== "openid-connect") {
                        return false;
                    }

                    if (protocolMapper.config === undefined) {
                        return false;
                    }

                    if (protocolMapper.config["claim.name"] !== "allowed-origins") {
                        return false;
                    }

                    return true;
                }
            );

            let protocolMapper: NonNullable<typeof protocolMapper_preexisting>;

            const config = {
                "introspection.token.claim": "true",
                "claim.value": '["*"]',
                "userinfo.token.claim": "true",
                "id.token.claim": "false",
                "lightweight.claim": "true",
                "access.token.claim": "true",
                "claim.name": "allowed-origins",
                "jsonType.label": "JSON",
                "access.tokenResponse.claim": "false"
            };

            if (protocolMapper_preexisting !== undefined) {
                protocolMapper = protocolMapper_preexisting;
            } else {
                protocolMapper = {
                    id: "8fd0d584-7052-4d04-a615-d18a71050873",
                    name: "allowed-origins",
                    protocol: "openid-connect",
                    protocolMapper: "oidc-hardcoded-claim-mapper",
                    consentRequired: false,
                    config
                };

                (client.protocolMappers ??= []).push(protocolMapper);
            }

            assert(protocolMapper.config !== undefined);

            if (config !== protocolMapper.config) {
                Object.assign(protocolMapper.config, config);
            }
        }
    }
}
