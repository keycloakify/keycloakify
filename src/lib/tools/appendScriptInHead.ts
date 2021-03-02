
export function appendScriptInHead(
    props: {
        src: string;
    }
) {

    const { src } = props;

    var script = document.createElement("script");

    Object.assign(
        script,
        {
            src,
            "type": "text/javascript",
        }
    );

    document.getElementsByTagName("head")[0].appendChild(script);

}
