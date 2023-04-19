import React from "react";
import { memo, useState } from "react";
import { useConstCallback } from "powerhooks";
import { keyframes } from "tss-react";
import keycloakifyLogoHeroMovingPngUrl from "./keycloakify-logo-hero-moving.png";
import keycloakifyLogoHeroStillPngUrl from "./keycloakify-logo-hero-still.png";
import { makeStyles } from "./tss";

export type Props = {
    style?: React.CSSProperties;
    id?: string;
    onLoad?: () => void;
};

export const KeycloakifyRotatingLogo = memo((props: Props) => {
    const { id, style, onLoad: onLoadProp } = props;

    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const onLoad = useConstCallback(() => {
        setIsImageLoaded(true);
        onLoadProp?.();
    });

    const { classes, cx } = useStyles({
        isImageLoaded
    });
    return (
        <div id={id} className={classes.root} style={style}>
            <img className={classes.rotatingImg} onLoad={onLoad} src={keycloakifyLogoHeroMovingPngUrl} alt={"Rotating react logo"} />
            <img className={classes.stillImg} src={keycloakifyLogoHeroStillPngUrl} alt={"keyhole"} />
        </div>
    );
});

const useStyles = makeStyles<{ isImageLoaded: boolean }>({
    "name": { KeycloakifyRotatingLogo }
})((_theme, { isImageLoaded }) => ({
    "root": {
        "position": "relative"
    },
    "rotatingImg": {
        "animation": `${keyframes({
            "from": {
                "transform": "rotate(0deg)"
            },
            "to": {
                "transform": "rotate(360deg)"
            }
        })} infinite 20s linear`,
        "width": isImageLoaded ? "100%" : undefined,
        "height": isImageLoaded ? "auto" : undefined
    },
    "stillImg": {
        "position": "absolute",
        "top": "0",
        "left": "0",
        "width": isImageLoaded ? "100%" : undefined,
        "height": isImageLoaded ? "auto" : undefined
    }
}));
