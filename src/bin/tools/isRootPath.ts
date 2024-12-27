import { normalize as pathNormalize } from "path";

export function getIsRootPath(filePath: string): boolean {
    const path_normalized = pathNormalize(filePath);

    // Unix-like root ("/")
    if (path_normalized === "/") {
        return true;
    }

    // Check for Windows drive root (e.g., "C:\\")
    if (/^[a-zA-Z]:\\$/.test(path_normalized)) {
        return true;
    }

    // Check for UNC root (e.g., "\\server\share")
    if (/^\\\\[^\\]+\\[^\\]+\\?$/.test(path_normalized)) {
        return true;
    }

    return false;
}
