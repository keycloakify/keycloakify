


import { KcContextBase } from "./KcContextBase";
import type { AndByDiscriminatingKey } from "../tools/AndByDiscriminatingKey";


export type ExtendsKcContextBase<KcContextExtended extends { pageId: string; }>=
	AndByDiscriminatingKey<
		"pageId", 
		KcContextExtended & KcContextBase.Common, 
		KcContextBase
	>;

type KcContextExtended =
	{ pageId: "register.ftl"; authorizedMailDomains: string[]; } |
	{ pageId: "my-extra-page-1.ftl"; } |
	{ pageId: "my-extra-page-2.ftl"; someCustomValue: string; };

const y: ExtendsKcContextBase<KcContextExtended> = null as any;


if (y.pageId === "register.ftl") {

	y.authorizedMailDomains;

	y.realm.displayName;

	y.register

}

if (y.pageId === "my-extra-page-1.ftl") {
	y.realm.displayName;
}

if (y.pageId === "my-extra-page-2.ftl") {

	y.realm
	y.someCustomValue

}

