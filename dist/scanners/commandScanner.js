import path from "node:path";
import { readJsonFile, readTextFile } from "../utils/file.js";
export async function scanCommands(rootDir) {
    const commands = [];
    const packageJson = await readJsonFile(path.join(rootDir, "package.json"));
    if (packageJson?.scripts) {
        for (const scriptName of Object.keys(packageJson.scripts)) {
            commands.push({
                source: "package.json",
                command: `npm run ${scriptName}`,
                description: packageJson.scripts[scriptName]
            });
        }
    }
    const makefile = await readTextFile(path.join(rootDir, "Makefile"));
    if (makefile) {
        const targets = parseMakefileTargets(makefile);
        for (const target of targets) {
            commands.push({
                source: "Makefile",
                command: `make ${target}`
            });
        }
    }
    const dockerCompose = (await readTextFile(path.join(rootDir, "docker-compose.yml"))) ??
        (await readTextFile(path.join(rootDir, "docker-compose.yaml")));
    if (dockerCompose) {
        commands.push({
            source: "docker-compose",
            command: "docker compose up"
        });
        commands.push({
            source: "docker-compose",
            command: "docker compose down"
        });
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
