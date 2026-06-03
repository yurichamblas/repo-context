import path from "node:path";

export function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

export function getProjectName(rootDir: string): string {
  return path.basename(path.resolve(rootDir));
}
