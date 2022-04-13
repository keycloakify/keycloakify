export function argv(key: string) {
    if (process.argv.includes(`--${key}`)) return true;

    const value = process.argv.find(element => element.startsWith(`--${key}=`));

    if (!value) return "";

    return value.replace(`--${key}=`, "");
}
