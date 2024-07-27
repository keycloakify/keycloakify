if (!(Object as any).fromEntries) {
    Object.defineProperty(Object, "fromEntries", {
        value: function (entries: any) {
            if (!entries || !entries[Symbol.iterator]) {
                throw new Error(
                    "Object.fromEntries() requires a single iterable argument"
                );
            }

            const o: any = {};

            Object.keys(entries).forEach(key => {
                const [k, v] = entries[key];

                o[k] = v;
            });

            return o;
        }
    });
}

export {};
