import path from "node:path";
import { readTextFile } from "../utils/file.js";
export async function scanEnvironmentVariables(rootDir) {
    const envFiles = [".env.example", ".env.sample"];
    const variables = new Set();
    for (const envFile of envFiles) {
        const content = await readTextFile(path.join(rootDir, envFile));
        if (!content) {
            continue;
        }
        for (const rawLine of content.split("\n")) {
            let line = rawLine.trim();
            if (!line || line.startsWith("#")) {
                continue;
            }
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
