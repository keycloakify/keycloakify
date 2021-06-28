
export function deepClone<T>(arg: T): T {
	return JSON.parse(JSON.stringify(arg));
}