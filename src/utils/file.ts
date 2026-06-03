import fs from "node:fs/promises";
import path from "node:path";

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  const content = await readTextFile(filePath);

  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function resolveFromRoot(rootDir: string, relativePath: string): string {
  return path.join(rootDir, relativePath);
}
