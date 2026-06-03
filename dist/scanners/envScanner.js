import path from "node:path";
import fg from "fast-glob";
import { readTextFile } from "../utils/file.js";
import { SCAN_IGNORE_GLOBS } from "../config/defaults.js";
export async function scanEnvironmentVariables(rootDir) {
    // Only ever read templates — never a real `.env`. Matched recursively so a
    // monorepo's per-package templates (e.g. backend/.env.example) are covered.
    const files = await fg(["**/.env.example", "**/.env.sample"], {
        cwd: rootDir,
        onlyFiles: true,
        dot: true,
        ignore: SCAN_IGNORE_GLOBS
    });
    const variables = new Set();
    for (const relativePath of files) {
        const content = await readTextFile(path.join(rootDir, relativePath));
        if (!content)
            continue;
        for (const rawLine of content.split("\n")) {
            let line = rawLine.trim();
            if (!line || line.startsWith("#"))
                continue;
            // Support `export KEY=value` declarations.
            if (line.startsWith("export ")) {
                line = line.slice("export ".length).trim();
            }
            const key = line.split("=")[0]?.trim();
            if (key && /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
                variables.add(key);
            }
        }
    }
    return Array.from(variables).sort();
}
