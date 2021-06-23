
import type { KcContextBase } from "./KcContextBase";
import { kcContextMocks, kcContextCommonMock } from "./kcContextMocks";
import { ftlValuesGlobalName } from "../../bin/build-keycloak-theme/ftlValuesGlobalName";

export function getKcContext<KcContextExtended extends { pageId: string; } = never>(
	params?: {
		mockPageId?: KcContextBase["pageId"] | KcContextExtended["pageId"];
		kcContextExtendedMock?: KcContextExtended[];
	}
): { kcContext: (KcContextBase | KcContextExtended & KcContextBase.Common) | undefined; } {

	const { mockPageId, kcContextExtendedMock } = params ?? { "mockPageId": false };

	if (mockPageId !== undefined) {

		return {
			"pageId": mockPageId,
			...(kcContextMocks.find(({ pageId }) => pageId === mockPageId) ?? kcContextCommonMock),
			...(kcContextExtendedMock?.find(({ pageId }) => pageId === mockPageId) ?? {})
		} as any;

	}

	return (window as any)[ftlValuesGlobalName];

}

