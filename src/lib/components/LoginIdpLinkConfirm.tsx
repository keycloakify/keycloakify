
import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContext } from "../KcContext";
import { useKcMessage } from "../i18n/useKcMessage";
import { cx } from "tss-react";

export const LoginIdpLinkConfirm = memo(({ kcContext, ...props }: { kcContext: KcContext.LoginIdpLinkConfirm; } & KcProps) => {

	const { msg } = useKcMessage();

	const { url, idpAlias } = kcContext;

	return (
		<Template
			{...{ kcContext, ...props }}
			headerNode={msg("confirmLinkIdpTitle")}
			formNode={
				<form id="kc-register-form" action={url.loginAction} method="post">
					<div className={cx(props.kcFormGroupClass)}>
						<button
							type="submit"
							className={cx(
								props.kcButtonClass,
								props.kcButtonDefaultClass,
								props.kcButtonBlockClass,
								props.kcButtonLargeClass
							)}
							name="submitAction"
							id="updateProfile"
							value="updateProfile"
						>
							{msg("confirmLinkIdpReviewProfile")}
						</button>
						<button
							type="submit"
							className={cx(
								props.kcButtonClass,
								props.kcButtonDefaultClass,
								props.kcButtonBlockClass,
								props.kcButtonLargeClass
							)}
							name="submitAction"
							id="linkAccount"
							value="linkAccount"
						>
							{msg("confirmLinkIdpContinue", idpAlias)}
						</button>
					</div>
				</form>
			}
		/>
	);

});


