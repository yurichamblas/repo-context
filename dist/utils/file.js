import fs from "node:fs/promises";
import path from "node:path";
export async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
export async function readTextFile(filePath) {
    try {
        return await fs.readFile(filePath, "utf8");
    }
    catch {
        return null;
    }
}
export async function readJsonFile(filePath) {
    const content = await readTextFile(filePath);
    if (!content) {
        return null;
    }
    try {
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export function resolveFromRoot(rootDir, relativePath) {
    return path.join(rootDir, relativePath);
}
