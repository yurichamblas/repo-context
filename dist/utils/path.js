import path from "node:path";
export function toPosixPath(filePath) {
    return filePath.split(path.sep).join("/");
}
export function getProjectName(rootDir) {
    return path.basename(path.resolve(rootDir));
}
