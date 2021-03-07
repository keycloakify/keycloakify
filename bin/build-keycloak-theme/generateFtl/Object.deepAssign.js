
Object.defineProperty(
    Object,
    "deepAssign",
    {
        "value": function callee(target, source) {
            Object.keys(source).forEach(function (key) {
                var value = source[key];
                if (target[key] === undefined) {
                    target[key] = value;
                    return;
                }
                if (value instanceof Object) {
                    if (value instanceof Array) {
                        value.forEach(function (entry) {
                            target[key].push(entry);
                        });
                        return;
                    }
                    callee(target[key], value);
                    return;
                }
                target[key] = value;
            });
            return target;
        }
    }
);