import fs from "node:fs/promises";
import path from "node:path";
import ignore from "ignore";
import { DEFAULT_IGNORE_PATTERNS } from "../config/defaults.js";
import { toPosixPath } from "../utils/path.js";
import { readTextFile } from "../utils/file.js";
export async function scanFileTree(rootDir, maxDepth) {
    const ig = ignore().add(DEFAULT_IGNORE_PATTERNS);
    const gitignore = await readTextFile(path.join(rootDir, ".gitignore"));
    if (gitignore) {
        ig.add(gitignore);
    }
    const lines = ["."];
    await walkDirectory(rootDir, rootDir, lines, ig, "", 0, maxDepth);
    return lines.join("\n");
}
async function walkDirectory(rootDir, currentDir, lines, ig, prefix, depth, maxDepth) {
    if (depth >= maxDepth) {
        return;
    }
    let entries;
    try {
        entries = await fs.readdir(currentDir, { withFileTypes: true });
    }
    catch {
        return;
    }
    const visibleEntries = entries
        .filter((entry) => !isIgnored(rootDir, currentDir, entry, ig))
        .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory())
            return -1;
        if (!a.isDirectory() && b.isDirectory())
            return 1;
        return a.name.localeCompare(b.name);
    });
    for (let index = 0; index < visibleEntries.length; index++) {
        const entry = visibleEntries[index];
        const isLast = index === visibleEntries.length - 1;
        const connector = isLast ? "└── " : "├── ";
        lines.push(`${prefix}${connector}${entry.name}${entry.isDirectory() ? "/" : ""}`);
        if (entry.isDirectory()) {
            const childPrefix = `${prefix}${isLast ? "    " : "│   "}`;
            await walkDirectory(rootDir, path.join(currentDir, entry.name), lines, ig, childPrefix, depth + 1, maxDepth);
        }
    }
}
function isIgnored(rootDir, currentDir, entry, ig) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = toPosixPath(path.relative(rootDir, absolutePath));
    if (!relativePath) {
        return false;
    }
    // Directory-only patterns (e.g. `tmp*/`) require the trailing slash to match.
    if (ig.ignores(relativePath)) {
        return true;
    }
    return entry.isDirectory() && ig.ignores(`${relativePath}/`);
}
