import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory, parameters } from "../PageStory";

const pageId = "log.ftl";

const { PageStory } = createPageStory({
    pageId
});

const meta = {
    title: `account/${pageId}`,
    component: PageStory
} satisfies Meta<typeof PageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <PageStory
            kcContext={{
                log: {
                    events: [
                        {
                            date: "2024-04-26T12:29:08Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T12:10:56Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T11:57:34Z",
                            ipAddress: "127.0.0.1",
                            client: "account",
                            details: [],
                            event: "update totp"
                        },
                        {
                            date: "2024-04-26T11:57:21Z",
                            ipAddress: "127.0.0.1",
                            client: "account",
                            details: [],
                            event: "update totp"
                        },
                        {
                            date: "2024-04-26T11:56:56Z",
                            ipAddress: "127.0.0.1",
                            client: "account",
                            details: [],
                            event: "remove totp"
                        },
                        {
                            date: "2024-04-26T11:56:55Z",
                            ipAddress: "127.0.0.1",
                            client: "account",
                            details: [],
                            event: "remove totp"
                        },
                        {
                            date: "2024-04-26T11:56:41Z",
                            ipAddress: "127.0.0.1",
                            client: "account",
                            details: [],
                            event: "update totp"
                        },
                        {
                            date: "2024-04-26T11:56:36Z",
                            ipAddress: "127.0.0.1",
                            client: "account",
                            details: [],
                            event: "update totp"
                        },
                        {
                            date: "2024-04-26T11:32:54Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:42:54Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:42:52Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:42:40Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:42:09Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "false",
                                    key: "remember_me"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:24:17Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [],
                            event: "logout"
                        },
                        {
                            date: "2024-04-26T09:23:54Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:23:50Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:23:47Z",
                            ipAddress: "127.0.0.1",
                            client: "account",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:23:15Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [],
                            event: "logout"
                        },
                        {
                            date: "2024-04-26T09:23:06Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:22:53Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [],
                            event: "logout"
                        },
                        {
                            date: "2024-04-26T09:21:29Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "false",
                                    key: "remember_me"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-26T09:17:32Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-18T11:19:09Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-18T11:18:50Z",
                            ipAddress: "127.0.0.1",
                            client: "keycloakify-frontend",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        },
                        {
                            date: "2024-04-18T11:18:24Z",
                            ipAddress: "127.0.0.1",
                            client: "account",
                            details: [
                                {
                                    value: "openid-connect",
                                    key: "auth_method"
                                },
                                {
                                    value: "john.doe",
                                    key: "username"
                                }
                            ],
                            event: "login"
                        }
                    ]
                }
            }}
        />
    )
};
