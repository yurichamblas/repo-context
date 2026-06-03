import path from "node:path";
import fg from "fast-glob";
import { readJsonFile, readTextFile } from "../utils/file.js";
import { toPosixPath } from "../utils/path.js";
import { SCAN_IGNORE_GLOBS } from "../config/defaults.js";
export async function scanCommands(rootDir) {
    const commands = [];
    const [packageJsonFiles, makefiles, composeFiles] = await Promise.all([
        fg(["**/package.json"], {
            cwd: rootDir,
            ignore: SCAN_IGNORE_GLOBS,
            onlyFiles: true
        }),
        fg(["**/Makefile"], {
            cwd: rootDir,
            ignore: SCAN_IGNORE_GLOBS,
            onlyFiles: true
        }),
        fg(["**/docker-compose.yml", "**/docker-compose.yaml", "**/compose.yml", "**/compose.yaml"], {
            cwd: rootDir,
            ignore: SCAN_IGNORE_GLOBS,
            onlyFiles: true
        })
    ]);
    for (const relativePath of packageJsonFiles.sort()) {
        const packageJson = await readJsonFile(path.join(rootDir, relativePath));
        if (!packageJson?.scripts)
            continue;
        const source = toPosixPath(relativePath);
        const dir = path.posix.dirname(source);
        const prefix = dir === "." ? "" : `cd ${dir} && `;
        for (const scriptName of Object.keys(packageJson.scripts)) {
            commands.push({
                source,
                command: `${prefix}npm run ${scriptName}`,
                description: packageJson.scripts[scriptName]
            });
        }
    }
    for (const relativePath of makefiles.sort()) {
        const content = await readTextFile(path.join(rootDir, relativePath));
        if (!content)
            continue;
        const source = toPosixPath(relativePath);
        const dir = path.posix.dirname(source);
        const prefix = dir === "." ? "" : `cd ${dir} && `;
        for (const target of parseMakefileTargets(content)) {
            commands.push({
                source,
                command: `${prefix}make ${target}`
            });
        }
    }
    for (const relativePath of composeFiles.sort()) {
        const source = toPosixPath(relativePath);
        const dir = path.posix.dirname(source);
        const prefix = dir === "." ? "" : `cd ${dir} && `;
        commands.push({ source, command: `${prefix}docker compose up` });
        commands.push({ source, command: `${prefix}docker compose down` });
    }
    return commands;
}
function parseMakefileTargets(content) {
    const targets = new Set();
    for (const line of content.split("\n")) {
        const match = line.match(/^([a-zA-Z0-9_-]+):/);
        if (match && !line.startsWith(".") && !line.includes("=")) {
            targets.add(match[1]);
        }
    }
    return Array.from(targets);
}
