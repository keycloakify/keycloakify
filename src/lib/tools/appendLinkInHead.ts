
export function appendLinkInHead(
    props: {
        href: string;
    }
) {

    const { href } = props;

    var link = document.createElement("link");

    Object.assign(
        link,
        {
            href,
            "type": "text/css",
            "rel": "stylesheet",
            "media": "screen,print"
        }
    );

    document.getElementsByTagName("head")[0].appendChild(link);

}
