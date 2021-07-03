
import { getKcContext } from "../../lib/getKcContext";
import type { KcContextBase } from "../../lib/getKcContext";
import type { ExtendsKcContextBase } from "../../lib/getKcContext/getKcContext";
import { same } from "evt/tools/inDepth";
import { doExtends } from "tsafe/doExtends";
import { assert } from "tsafe/assert";
import { kcContextMocks, kcContextCommonMock } from "../../lib/getKcContext/kcContextMocks";
import { deepClone } from "../../lib/tools/deepClone";
import type { Any } from "ts-toolbelt";

{

	const authorizedMailDomains = [
		"example.com",
		"another-example.com",
		"*.yet-another-example.com",
		"*.example.com",
		"hello-world.com"
	];

	const displayName = "this is an overwritten common value";

	const aNonStandardValue1 = "a non standard value 1";
	const aNonStandardValue2 = "a non standard value 2";

	type KcContextExtended = {
		pageId: "register.ftl";
		authorizedMailDomains: string[];
	} | {
		pageId: "info.ftl";
		aNonStandardValue1: string;
	} | {
		pageId: "my-extra-page-1.ftl";
	} | {
		pageId: "my-extra-page-2.ftl";
		aNonStandardValue2: string;
	};

	const getKcContextProxy = (
		params: {
			mockPageId: ExtendsKcContextBase<KcContextExtended>["pageId"];
		}
	) => {

		const { mockPageId } = params;

		const { kcContext } = getKcContext<KcContextExtended>({
			mockPageId,
			"mockData": [
				{
					"pageId": "login.ftl",
					"realm": { displayName }
				},
				{
					"pageId": "info.ftl",
					aNonStandardValue1
				},
				{
					"pageId": "register.ftl",
					authorizedMailDomains
				},
				{
					"pageId": "my-extra-page-2.ftl",
					aNonStandardValue2
				}
			]
		});

		return { kcContext };

	};

	{

		const pageId = "login.ftl";

		const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

		assert(kcContext?.pageId === pageId);

		doExtends<Any.Equals<typeof kcContext, KcContextBase.Login>, 1>();

		assert(same(
			//NOTE: deepClone for printIfExists or other functions...
			deepClone(kcContext),
			(() => {

				const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

				mock.realm.displayName = displayName;

				return mock;

			})()
		));

		console.log(`PASS ${pageId}`);

	}

	{
		const pageId = "info.ftl";

		const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

		assert(kcContext?.pageId === pageId);

		//NOTE: I don't understand the need to add: pageId: typeof pageId; ...
		doExtends<Any.Equals<typeof kcContext, KcContextBase.Info & { pageId: typeof pageId; aNonStandardValue1: string; }>, 1>();

		assert(same(
			deepClone(kcContext),
			(() => {

				const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

				Object.assign(mock, { aNonStandardValue1 });

				return mock;

			})()
		));

		console.log(`PASS ${pageId}`);

	}

	{
		const pageId = "register.ftl";

		const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

		assert(kcContext?.pageId === pageId);

		//NOTE: I don't understand the need to add: pageId: typeof pageId; ...
		doExtends<Any.Equals<typeof kcContext, KcContextBase.Register & { pageId: typeof pageId; authorizedMailDomains: string[]; }>, 1>();

		assert(same(
			deepClone(kcContext),
			(() => {

				const mock = deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!);

				Object.assign(mock, { authorizedMailDomains });

				return mock;

			})()
		));

		console.log(`PASS ${pageId}`);

	}

	{

		const pageId = "my-extra-page-2.ftl";

		const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

		assert(kcContext?.pageId === pageId);

		doExtends<Any.Equals<typeof kcContext, KcContextBase.Common & { pageId: typeof pageId; aNonStandardValue2: string; }>, 1>();

		kcContext.aNonStandardValue2;

		assert(same(
			deepClone(kcContext),
			(() => {

				const mock = deepClone(kcContextCommonMock);

				Object.assign(mock, { pageId, aNonStandardValue2 });

				return mock;

			})()
		));

		console.log(`PASS ${pageId}`);

	}

	{

		const pageId = "my-extra-page-1.ftl";

		console.log("We expect a warning here =>");

		const { kcContext } = getKcContextProxy({ "mockPageId": pageId });


		assert(kcContext?.pageId === pageId);

		doExtends<Any.Equals<typeof kcContext, KcContextBase.Common & { pageId: typeof pageId;  }>, 1>();

		assert(same(
			deepClone(kcContext),
			(() => {

				const mock = deepClone(kcContextCommonMock);

				Object.assign(mock, { pageId });

				return mock;

			})()
		));

		console.log(`PASS ${pageId}`);

	}

}

{

	const pageId = "login.ftl";

	const { kcContext } = getKcContext({
		"mockPageId": pageId
	});

	doExtends<Any.Equals<typeof kcContext, KcContextBase | undefined>, 1>();

	assert(same(
		deepClone(kcContext),
		deepClone(kcContextMocks.find(({ pageId: pageId_i }) => pageId_i === pageId)!)
	));

	console.log("PASS no extension");

}


{

	const { kcContext } = getKcContext();

	doExtends<Any.Equals<typeof kcContext, KcContextBase | undefined>, 1>();

	assert(kcContext === undefined);

	console.log("PASS no extension, no mock");

}



