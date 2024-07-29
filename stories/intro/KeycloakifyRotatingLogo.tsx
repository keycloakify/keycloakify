import React from "react";
import { memo, useState } from "react";
import { useConstCallback } from "powerhooks";
import { keyframes } from "tss-react";
// @ts-expect-error
import keycloakifyLogoHeroMovingPngUrl from "./keycloakify-logo-hero-moving.png";
// @ts-expect-error
import keycloakifyLogoHeroStillPngUrl from "./keycloakify-logo-hero-still.png";
import { tss } from "../tss";

export type Props = {
    className?: string;
    id?: string;
    onLoad?: () => void;
};

export const KeycloakifyRotatingLogo = memo((props: Props) => {
    const { id, className, onLoad: onLoadProp } = props;

    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const onLoad = useConstCallback(() => {
        setIsImageLoaded(true);
        onLoadProp?.();
    });

    const { cx, classes } = useStyles({
        isImageLoaded
    });
    return (
        <div id={id} className={cx(classes.root, className)}>
            <img className={classes.rotatingImg} onLoad={onLoad} src={keycloakifyLogoHeroMovingPngUrl} alt={"Rotating react logo"} />
            <img className={classes.stillImg} src={keycloakifyLogoHeroStillPngUrl} alt={"keyhole"} />
        </div>
    );
});

const useStyles = tss
    .withParams<{ isImageLoaded: boolean }>()
    .withName({ KeycloakifyRotatingLogo })
    .create(({ isImageLoaded }) => ({
        root: {
            position: "relative"
        },
        rotatingImg: {
            animation: `${keyframes({
                from: {
                    transform: "rotate(0deg)"
                },
                to: {
                    transform: "rotate(360deg)"
                }
            })} infinite 20s linear`,
            width: isImageLoaded ? "100%" : undefined,
            height: isImageLoaded ? "auto" : undefined
        },
        stillImg: {
            position: "absolute",
            top: "0",
            left: "0",
            width: isImageLoaded ? "100%" : undefined,
            height: isImageLoaded ? "auto" : undefined
        }
    }));
