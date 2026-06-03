import fs from "node:fs/promises";
import path from "node:path";
import ignore from "ignore";
import { DEFAULT_IGNORE_PATTERNS } from "../config/defaults.js";
import { toPosixPath } from "../utils/path.js";
import { readTextFile } from "../utils/file.js";

export async function scanFileTree(
  rootDir: string,
  maxDepth: number
): Promise<string> {
  const ig = ignore().add(expandDirectoryPatterns(DEFAULT_IGNORE_PATTERNS));

  const gitignore = await readTextFile(path.join(rootDir, ".gitignore"));
  if (gitignore) {
    ig.add(gitignore);
  }

  const lines: string[] = ["."];
  await walkDirectory(rootDir, rootDir, lines, ig, "", 0, maxDepth);

  return lines.join("\n");
}

/**
 * A pattern like `node_modules/**` only matches the *contents* of the folder,
 * not the folder itself, so the directory entry would still be walked. Adding
 * the bare `node_modules` form lets us prune the directory outright.
 */
function expandDirectoryPatterns(patterns: string[]): string[] {
  const expanded = new Set<string>();

  for (const pattern of patterns) {
    expanded.add(pattern);
    if (pattern.endsWith("/**")) {
      expanded.add(pattern.slice(0, -3));
    }
  }

  return Array.from(expanded);
}

async function walkDirectory(
  rootDir: string,
  currentDir: string,
  lines: string[],
  ig: ReturnType<typeof ignore>,
  prefix: string,
  depth: number,
  maxDepth: number
): Promise<void> {
  if (depth >= maxDepth) {
    return;
  }

  let entries;
  try {
    entries = await fs.readdir(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  const visibleEntries = entries
    .filter((entry) => {
      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = toPosixPath(path.relative(rootDir, absolutePath));

      if (!relativePath) {
        return true;
      }

      const probe = entry.isDirectory() ? `${relativePath}/` : relativePath;
      return !ig.ignores(probe);
    })
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (let index = 0; index < visibleEntries.length; index++) {
    const entry = visibleEntries[index];
    const isLast = index === visibleEntries.length - 1;
    const connector = isLast ? "└── " : "├── ";

    lines.push(
      `${prefix}${connector}${entry.name}${entry.isDirectory() ? "/" : ""}`
    );

    if (entry.isDirectory()) {
      const childPrefix = `${prefix}${isLast ? "    " : "│   "}`;
      await walkDirectory(
        rootDir,
        path.join(currentDir, entry.name),
        lines,
        ig,
        childPrefix,
        depth + 1,
        maxDepth
      );
    }
  }
}
