
export type AndByDiscriminatingKey<
	DiscriminatingKey extends string,
	U1 extends Record<DiscriminatingKey, string>,
	U2 extends Record<DiscriminatingKey, string>
	> =
	AndByDiscriminatingKey.Tf1<DiscriminatingKey, U1, U1, U2>;

export declare namespace AndByDiscriminatingKey {

	export type Tf1<
		DiscriminatingKey extends string,
		U1,
		U1Again extends Record<DiscriminatingKey, string>,
		U2 extends Record<DiscriminatingKey, string>
		> =
		U1 extends Pick<U2, DiscriminatingKey> ?
		Tf2<DiscriminatingKey, U1, U2, U1Again> :
		U1;

	export type Tf2<
		DiscriminatingKey extends string,
		SingletonU1 extends Record<DiscriminatingKey, string>,
		U2,
		U1 extends Record<DiscriminatingKey, string>
		> =
		U2 extends Pick<SingletonU1, DiscriminatingKey> ?
		U2 & SingletonU1 :
		U2 extends Pick<U1, DiscriminatingKey> ?
		never :
		U2;

}


