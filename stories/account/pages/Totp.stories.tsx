import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { createPageStory } from "../createPageStory";

const pageId = "totp.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<any> = {
    title: `account/${pageId}`,
    component: PageStory,
    parameters: {
        viewMode: "story",
        previewTabs: {
            "storybook/docs/panel": {
                hidden: true
            }
        }
    }
};

export default meta;

export const Default = () => (
    <PageStory
        kcContext={{
            totp: {
                enabled: false,
                totpSecretEncoded: "HB2W ESCK KJKF K5DC GJQX S5RQ I5AX CZ2U",
                totpSecret: "8ubHJRTUtb2ayv0GAqgT",
                manualUrl: "http://localhost:8080/realms/master/account/totp?mode=manual",
                supportedApplications: ["totpAppFreeOTPName", "totpAppMicrosoftAuthenticatorName", "totpAppGoogleName"],
                totpSecretQrCode:
                    "iVBORw0KGgoAAAANSUhEUgAAAPYAAAD2AQAAAADNaUdlAAACoUlEQVR4Xu2YPW7DMAxGGWTImCP4JvbFAtiAL+bcxEfI6MEI+z3Kzl+BLh2oIRwEV08FJIr8SMX8T1vtc+bdvvxz5t2+/HPm3eA3Mzvc+jm+fDoPzXIQkPV18N79ejvOWnRpTlcf/XTVV4Aq+MU0uzZaZI12rZVml4YzVcQHDTrEYufBKuQaZEfX1TvDWhEv98+ty79dGX7HRx438ofQfB04Th08jNS+us+n+1l/XbfZKrgcumj/trRnpfak0Dw54Xp/nC+Xy5bOB7x6dDxt1sq5j/tP52vkd5Ee+Xc1JfnKmergxKdcOyOSCgLik5xXEtXBtXVVvTFcC+pdV6+YqIVT+rpNf4hKjqMgXdo9frO5ldAM1dFJfA7+1O9srqiM4W6otuYQIZ0pvivg8mWUvo6q14VImuTocf/JXFq4cP8lPifld/jXidQqOL0CX0V66L9a6Y9Pu34nc7XW8qoQQ9GfcghVwiq4kStqDdl1hGZpZ3f/ZnN9qyCHkTrWq4nl/l/8n8tVmieL1lpFhiDw0uQ84jeXl4ahp+tay/1r6/ai3/kchxKQI6njyCX64zg8n2s4RZEhIDkJ5ZD9b/mTzZnVq2mmMFP/RjJpwNObf7M5qa0Lj9K837/kvKuEu1ov6p9EiEXkd8ei+57f+VwJPSCSfSnNWkR8PvefytFvK/1riPiIEkXM1sGl39qrWlcEm9K3OXnXn2wO4qcFhWZ02uFk2dO/uTwMJx9ostn6Q4mq4LzvDmoSqXqzE5+8BHiOVsJ7arH661ZFuixCGp/+z+ZsWF+ROuR3I9faS39YBS82F9d2rpWkUzWchqFFdWitS5C+9F+5vC/3T/9Fkl8Y+H3BN/9mc/KHRwrxGa9iePnHGvhf9uWfM+/25Z8z7/Zv/gPV7u6J7fyCcQAAAABJRU5ErkJggg==",
                qrUrl: "http://localhost:8080/realms/master/account/totp?mode=qr",
                otpCredentials: []
            },
            url: {
                resourcesPath: "/resources/ueycc/account/keycloakify-starter",
                resourceUrl: "http://localhost:8080/realms/master/account/resource",
                resourcesCommonPath: "/resources/ueycc/account/keycloakify-starter/resources-common",
                logUrl: "http://localhost:8080/realms/master/account/log",
                socialUrl: "http://localhost:8080/realms/master/account/identity",
                accountUrl: "http://localhost:8080/realms/master/account/",
                sessionsUrl: "http://localhost:8080/realms/master/account/sessions",
                totpUrl: "http://localhost:8080/realms/master/account/totp",
                applicationsUrl: "http://localhost:8080/realms/master/account/applications",
                passwordUrl: "http://localhost:8080/realms/master/account/password"
            }
        }}
    />
);

export const WithTotpEnabled = () => (
    <PageStory
        kcContext={{
            totp: {
                enabled: true,
                totpSecretEncoded: "HB2W ESCK KJKF K5DC GJQX S5RQ I5AX CZ2U",
                totpSecret: "8ubHJRTUtb2ayv0GAqgT",
                manualUrl: "http://localhost:8080/realms/master/account/totp?mode=manual",
                supportedApplications: ["totpAppFreeOTPName", "totpAppMicrosoftAuthenticatorName", "totpAppGoogleName"],
                totpSecretQrCode:
                    "iVBORw0KGgoAAAANSUhEUgAAAPYAAAD2AQAAAADNaUdlAAACoUlEQVR4Xu2YPW7DMAxGGWTImCP4JvbFAtiAL+bcxEfI6MEI+z3Kzl+BLh2oIRwEV08FJIr8SMX8T1vtc+bdvvxz5t2+/HPm3eA3Mzvc+jm+fDoPzXIQkPV18N79ejvOWnRpTlcf/XTVV4Aq+MU0uzZaZI12rZVml4YzVcQHDTrEYufBKuQaZEfX1TvDWhEv98+ty79dGX7HRx438ofQfB04Th08jNS+us+n+1l/XbfZKrgcumj/trRnpfak0Dw54Xp/nC+Xy5bOB7x6dDxt1sq5j/tP52vkd5Ee+Xc1JfnKmergxKdcOyOSCgLik5xXEtXBtXVVvTFcC+pdV6+YqIVT+rpNf4hKjqMgXdo9frO5ldAM1dFJfA7+1O9srqiM4W6otuYQIZ0pvivg8mWUvo6q14VImuTocf/JXFq4cP8lPifld/jXidQqOL0CX0V66L9a6Y9Pu34nc7XW8qoQQ9GfcghVwiq4kStqDdl1hGZpZ3f/ZnN9qyCHkTrWq4nl/l/8n8tVmieL1lpFhiDw0uQ84jeXl4ahp+tay/1r6/ai3/kchxKQI6njyCX64zg8n2s4RZEhIDkJ5ZD9b/mTzZnVq2mmMFP/RjJpwNObf7M5qa0Lj9K837/kvKuEu1ov6p9EiEXkd8ei+57f+VwJPSCSfSnNWkR8PvefytFvK/1riPiIEkXM1sGl39qrWlcEm9K3OXnXn2wO4qcFhWZ02uFk2dO/uTwMJx9ostn6Q4mq4LzvDmoSqXqzE5+8BHiOVsJ7arH661ZFuixCGp/+z+ZsWF+ROuR3I9faS39YBS82F9d2rpWkUzWchqFFdWitS5C+9F+5vC/3T/9Fkl8Y+H3BN/9mc/KHRwrxGa9iePnHGvhf9uWfM+/25Z8z7/Zv/gPV7u6J7fyCcQAAAABJRU5ErkJggg==",
                qrUrl: "http://localhost:8080/realms/master/account/totp?mode=qr",
                otpCredentials: []
            },
            url: {
                resourcesPath: "/resources/ueycc/account/keycloakify-starter",
                resourceUrl: "http://localhost:8080/realms/master/account/resource",
                resourcesCommonPath: "/resources/ueycc/account/keycloakify-starter/resources-common",
                logUrl: "http://localhost:8080/realms/master/account/log",
                socialUrl: "http://localhost:8080/realms/master/account/identity",
                accountUrl: "http://localhost:8080/realms/master/account/",
                sessionsUrl: "http://localhost:8080/realms/master/account/sessions",
                totpUrl: "http://localhost:8080/realms/master/account/totp",
                applicationsUrl: "http://localhost:8080/realms/master/account/applications",
                passwordUrl: "http://localhost:8080/realms/master/account/password"
            }
        }}
    />
);

export const WithManualMode = () => (
    <PageStory
        kcContext={{
            mode: "manual",
            totp: {
                enabled: false,
                totpSecretEncoded: "HB2W ESCK KJKF K5DC GJQX S5RQ I5AX CZ2U",
                totpSecret: "8ubHJRTUtb2ayv0GAqgT",
                manualUrl: "http://localhost:8080/realms/master/account/totp?mode=manual",
                supportedApplications: ["totpAppFreeOTPName", "totpAppMicrosoftAuthenticatorName", "totpAppGoogleName"],
                totpSecretQrCode:
                    "iVBORw0KGgoAAAANSUhEUgAAAPYAAAD2AQAAAADNaUdlAAACoUlEQVR4Xu2YPW7DMAxGGWTImCP4JvbFAtiAL+bcxEfI6MEI+z3Kzl+BLh2oIRwEV08FJIr8SMX8T1vtc+bdvvxz5t2+/HPm3eA3Mzvc+jm+fDoPzXIQkPV18N79ejvOWnRpTlcf/XTVV4Aq+MU0uzZaZI12rZVml4YzVcQHDTrEYufBKuQaZEfX1TvDWhEv98+ty79dGX7HRx438ofQfB04Th08jNS+us+n+1l/XbfZKrgcumj/trRnpfak0Dw54Xp/nC+Xy5bOB7x6dDxt1sq5j/tP52vkd5Ee+Xc1JfnKmergxKdcOyOSCgLik5xXEtXBtXVVvTFcC+pdV6+YqIVT+rpNf4hKjqMgXdo9frO5ldAM1dFJfA7+1O9srqiM4W6otuYQIZ0pvivg8mWUvo6q14VImuTocf/JXFq4cP8lPifld/jXidQqOL0CX0V66L9a6Y9Pu34nc7XW8qoQQ9GfcghVwiq4kStqDdl1hGZpZ3f/ZnN9qyCHkTrWq4nl/l/8n8tVmieL1lpFhiDw0uQ84jeXl4ahp+tay/1r6/ai3/kchxKQI6njyCX64zg8n2s4RZEhIDkJ5ZD9b/mTzZnVq2mmMFP/RjJpwNObf7M5qa0Lj9K837/kvKuEu1ov6p9EiEXkd8ei+57f+VwJPSCSfSnNWkR8PvefytFvK/1riPiIEkXM1sGl39qrWlcEm9K3OXnXn2wO4qcFhWZ02uFk2dO/uTwMJx9ostn6Q4mq4LzvDmoSqXqzE5+8BHiOVsJ7arH661ZFuixCGp/+z+ZsWF+ROuR3I9faS39YBS82F9d2rpWkUzWchqFFdWitS5C+9F+5vC/3T/9Fkl8Y+H3BN/9mc/KHRwrxGa9iePnHGvhf9uWfM+/25Z8z7/Zv/gPV7u6J7fyCcQAAAABJRU5ErkJggg==",
                qrUrl: "http://localhost:8080/realms/master/account/totp?mode=qr",
                otpCredentials: []
            },
            url: {
                resourcesPath: "/resources/ueycc/account/keycloakify-starter",
                resourceUrl: "http://localhost:8080/realms/master/account/resource",
                resourcesCommonPath: "/resources/ueycc/account/keycloakify-starter/resources-common",
                logUrl: "http://localhost:8080/realms/master/account/log",
                socialUrl: "http://localhost:8080/realms/master/account/identity",
                accountUrl: "http://localhost:8080/realms/master/account/",
                sessionsUrl: "http://localhost:8080/realms/master/account/sessions",
                totpUrl: "http://localhost:8080/realms/master/account/totp",
                applicationsUrl: "http://localhost:8080/realms/master/account/applications",
                passwordUrl: "http://localhost:8080/realms/master/account/password"
            }
        }}
    />
);
