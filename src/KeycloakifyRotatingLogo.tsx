
/* eslint-disable @typescript-eslint/no-namespace */
import { memo, useState } from "react";
import { makeStyles } from "theme";
import { useConstCallback } from "powerhooks";
import { keyframes } from "tss-react";
import keycloakifyLogoHeroMovingPngUrl from "assets/img/keycloakify-logo-hero-moving.png";
import keycloakifyLogoHeroStillPngUrl from "assets/img/keycloakify-logo-hero-still.png";

export type Props = {
	className?: string;
	id?: string;
	onLoad?: () => void;
};

export const KeycloakifyRotatingLogo = memo((props: Props) => {
	const {
		id,
		className,
		onLoad: onLoadProp,
	} = props;

	const [isImageLoaded, setIsImageLoaded] = useState(false);

	const onLoad = useConstCallback(() => {
		setIsImageLoaded(true);
		onLoadProp?.();
	});

	const { classes, cx } = useStyles({
		isImageLoaded,
	});
	return (
		<div id={id} className={cx(classes.root, className)} >
			<img
				className={classes.rotatingImg}
				onLoad={onLoad}
				src={keycloakifyLogoHeroMovingPngUrl}
				alt={"Rotating react logo"}
			/>
			<img

				className={classes.stillImg}
				src={keycloakifyLogoHeroStillPngUrl}
				alt={"keyhole"}
			/>
		</div>
	);
});

const useStyles = makeStyles<{ isImageLoaded: boolean; }>({
	"name": { KeycloakifyRotatingLogo },
})((_theme, { isImageLoaded }) => ({
	"root": {
		"position": "relative",
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
		"height": isImageLoaded ? "auto" : undefined,
	},
	"stillImg": {
		"position": "absolute",
		"top": "0",
		"left": "0",
		"width": isImageLoaded ? "100%" : undefined,
		"height": isImageLoaded ? "auto" : undefined,
	}
}));
