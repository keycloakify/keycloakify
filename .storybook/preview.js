import { darkTheme, lightTheme } from "./customTheme";
import { DocsContainer } from "./DocsContainer";

export const parameters = {
    "actions": { "argTypesRegex": "^on[A-Z].*" },
    "controls": {
        "matchers": {
            "color": /(background|color)$/i,
            "date": /Date$/,
        },
    },
    "backgrounds": { "disable": true },
    "darkMode": {
        "light": lightTheme,
        "dark": darkTheme,
    },
    "docs": {
        "container": DocsContainer
    },
    "controls": {
        "disable": true,
    },
    "actions": {
        "disable": true
    },
    "viewport": {
        "viewports": {
            "1440p": {
                "name": "1440p",
                "styles": {
                    "width": "2560px",
                    "height": "1440px",
                },
            },
            "fullHD": {
                "name": "Full HD",
                "styles": {
                    "width": "1920px",
                    "height": "1080px",
                },
            },
            "macBookProBig": {
                "name": "MacBook Pro Big",
                "styles": {
                    "width": "1024px",
                    "height": "640px",
                },
            },
            "macBookProMedium": {
                "name": "MacBook Pro Medium",
                "styles": {
                    "width": "1440px",
                    "height": "900px",
                },
            },
            "macBookProSmall": {
                "name": "MacBook Pro Small",
                "styles": {
                    "width": "1680px",
                    "height": "1050px",
                },
            },
            "pcAgent": {
                "name": "PC Agent",
                "styles": {
                    "width": "960px",
                    "height": "540px",
                },
            },
            "iphone12Pro": {
                "name": "Iphone 12 pro",
                "styles": {
                    "width": "390px",
                    "height": "844px",
                },
            },
            "iphone5se": {
                "name": "Iphone 5/SE",
                "styles": {
                    "width": "320px",
                    "height": "568px",
                },
            },
            "ipadPro": {
                "name": "Ipad pro",
                "styles": {
                    "width": "1240px",
                    "height": "1366px",
                },
            },
            "Galaxy s9+": {
                "name": "Galaxy S9+",
                "styles": {
                    "width": "320px",
                    "height": "658px",
                },
            }
        },
    },
    "options": {
        "storySort": (a, b) =>
            getHardCodedWeight(b[1].kind) - getHardCodedWeight(a[1].kind),
    },
};

const { getHardCodedWeight } = (() => {

    const orderedPagesPrefix = [
        "Introduction",
        //"components/Header",
        //"components/Footer",
        "components/Alert",
        "components/Tabs",
        "components/Stepper",
        "components/Button",
    ];

    function getHardCodedWeight(kind) {

        for (let i = 0; i < orderedPagesPrefix.length; i++) {
            if (kind.toLowerCase().startsWith(orderedPagesPrefix[i].toLowerCase())) {
                return orderedPagesPrefix.length - i;
            }
        }

        return 0;
    }

    return { getHardCodedWeight };
})();
