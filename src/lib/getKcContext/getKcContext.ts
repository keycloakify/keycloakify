
import type { KcContextBase } from "./KcContextBase";
import { kcContextMocks, kcContextCommonMock } from "./kcContextMocks";
import { ftlValuesGlobalName } from "../../bin/build-keycloak-theme/ftlValuesGlobalName";
import type { AndByDiscriminatingKey } from "../tools/AndByDiscriminatingKey";
import type { DeepPartial } from "../tools/DeepPartial";
import { deepAssign } from "../tools/deepAssign";


export type ExtendsKcContextBase<
	KcContextExtended extends ({ pageId: string; } | undefined)
	> =
	KcContextExtended extends undefined ?
	KcContextBase :
	AndByDiscriminatingKey<
		"pageId",
		KcContextExtended & KcContextBase.Common,
		KcContextBase
	>;

export function getKcContext<KcContextExtended extends ({ pageId: string; } | undefined) = undefined>(
	params?: {
		mockPageId?: ExtendsKcContextBase<KcContextExtended>["pageId"];
		mockData?: readonly DeepPartial<ExtendsKcContextBase<KcContextExtended>>[];
	}
): { kcContext: ExtendsKcContextBase<KcContextExtended> | undefined; } {

	const {
		mockPageId,
		mockData
	} = params ?? {};

	if (mockPageId !== undefined) {

		//TODO maybe trow if no mock fo custom page

		const kcContextDefaultMock = kcContextMocks.find(({ pageId }) => pageId === mockPageId);

		const partialKcContextCustomMock = mockData?.find(({ pageId }) => pageId === mockPageId);

		if (
			kcContextDefaultMock === undefined &&
			partialKcContextCustomMock === undefined
		) {

			console.warn([
				`WARNING: You declared the non build in page ${mockPageId} but you didn't `,
				`provide mock data needed to debug the page outside of Keycloak as you are trying to do now.`,
				`Please check the documentation of the getKcContext function`
			].join("\n"));

		}

		const kcContext: any = { "pageId": mockPageId };

		deepAssign({
			"target": kcContext,
			"source": kcContextCommonMock
		});

		if (kcContextDefaultMock !== undefined) {

			deepAssign({
				"target": kcContext,
				"source": kcContextDefaultMock
			});

		}

		if (partialKcContextCustomMock !== undefined) {

			deepAssign({
				"target": kcContext,
				"source": partialKcContextCustomMock
			});

		}

		return { kcContext };

	}

	return {
		"kcContext":
			typeof window === "undefined" ?
				undefined :
				(window as any)[ftlValuesGlobalName]
	};

}



