
import { getKcContext } from "../../lib/getKcContext";
import type { KcContextBase } from "../../lib/getKcContext";
import type { ExtendsKcContextBase } from "../../lib/getKcContext/getKcContext";
import { same } from "evt/tools/inDepth";
import { doExtends } from "tsafe/doExtends";
import { assert } from "tsafe/assert";
import { kcContextMocks, kcContextCommonMock } from "../../lib/getKcContext/kcContextMocks";
import { deepClone } from "../../lib/tools/deepClone";
import type { Any } from "ts-toolbelt";


const authorizedMailDomains = [
	"example.com",
	"another-example.com",
	"*.yet-another-example.com",
	"*.example.com",
	"hello-world.com"
];

const displayName = "this is an overwritten common value";

const aNonStandardValue = "a non standard value";

type KcContextExtended = {
	pageId: "register.ftl";
	authorizedMailDomains: string[];
} | {
	pageId: "my-extra-page-1.ftl";
} | {
	pageId: "my-extra-page-2.ftl";
	aNonStandardValue: string;
};

function getKcContextProxy(
	params: {
		mockPageId: ExtendsKcContextBase<KcContextExtended>["pageId"];
	}
) {

	const { mockPageId } = params;

	const { kcContext } = getKcContext<KcContextExtended>({
		mockPageId,
		"mockData": [
			{
				"pageId": "login.ftl",
				"realm": { displayName }
			},
			{
				"pageId": "register.ftl",
				authorizedMailDomains
			},
			{
				"pageId": "my-extra-page-2.ftl",
				aNonStandardValue
			}
		]
	});

	return { kcContext };

}

{

	const pageId= "login.ftl";

	const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

	//@ts-expect-error
	doExtends<Any.Equals<typeof kcContext, any>, 1>();

	assert(kcContext?.pageId === pageId);

	doExtends<typeof kcContext, KcContextBase.Login>();

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
	const pageId = "register.ftl";

	const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

	//@ts-expect-error
	doExtends<Any.Equals<typeof kcContext, any>, 1>();

	assert(kcContext?.pageId === pageId);

	doExtends<typeof kcContext, KcContextBase.Register>();

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

	const pageId  = "my-extra-page-2.ftl";

	const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

	//@ts-expect-error
	doExtends<Any.Equals<typeof kcContext, any>, 1>();

	assert(kcContext?.pageId === pageId);

	//@ts-expect-error
	doExtends<typeof kcContext, KcContextBase>();

	doExtends<typeof kcContext, KcContextBase.Common>();

	assert(same(
		deepClone(kcContext),
		(() => {

			const mock = deepClone(kcContextCommonMock);

			Object.assign(mock, { pageId, aNonStandardValue });

			return mock;

		})()
	));

	console.log(`PASS ${pageId}`);

}

{

	const pageId  = "my-extra-page-1.ftl";

	console.log("We expect a warning here =>");

	const { kcContext } = getKcContextProxy({ "mockPageId": pageId });

	//@ts-expect-error
	doExtends<Any.Equals<typeof kcContext, any>, 1>();

	assert(kcContext?.pageId === pageId);

	//@ts-expect-error
	doExtends<typeof kcContext, KcContextBase>();

	doExtends<typeof kcContext, KcContextBase.Common>();

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

{
	const { kcContext } = getKcContext();

	//@ts-expect-error
	doExtends<Any.Equals<typeof kcContext, any>, 1>();

	doExtends<typeof kcContext, KcContextBase | undefined>();

}






