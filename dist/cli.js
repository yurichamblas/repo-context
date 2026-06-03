#!/usr/bin/env node
import { Command } from "commander";
import { generateRepoContext } from "./generate.js";
import { DEFAULT_MAX_DEPTH, DEFAULT_OUTPUT_FILE } from "./config/defaults.js";
const program = new Command();
program
    .name("repo-context")
    .description("Generate clean, LLM-ready context files for any codebase.")
    .version("0.1.0");
program
    .command("generate")
    .description("Generate a repo-context.md file for the current repository.")
    .option("-r, --root <path>", "Repository root directory", process.cwd())
    .option("-o, --output <file>", "Output Markdown file", DEFAULT_OUTPUT_FILE)
    .option("-d, --max-depth <number>", "Maximum folder tree depth", String(DEFAULT_MAX_DEPTH))
    .option("-p, --profile <profile>", "Output profile: default, claude, cursor, codex", "default")
    .action(async (options) => {
    try {
        const profile = validateProfile(options.profile);
        const maxDepth = Number.parseInt(options.maxDepth, 10);
        if (Number.isNaN(maxDepth) || maxDepth < 1) {
            throw new Error("--max-depth must be a positive number.");
        }
        const result = await generateRepoContext({
            rootDir: options.root,
            output: options.output,
            maxDepth,
            profile
        });
        console.log("");
        console.log("Repository context generated.");
        console.log("");
        console.log(`Output: ${result.outputPath}`);
        console.log(`Detected stack: ${formatCount(result.context.detectedStack.length)}`);
        console.log(`Important files: ${formatCount(result.context.importantFiles.length)}`);
        console.log(`Commands: ${formatCount(result.context.commands.length)}`);
        console.log(`Environment variables: ${formatCount(result.context.environmentVariables.length)}`);
        console.log("");
    }
    catch (error) {
        console.error("");
        console.error("Failed to generate repository context.");
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(error);
        }
        console.error("");
        process.exit(1);
    }
});
program.parseAsync();
function validateProfile(value) {
    const allowedProfiles = [
        "default",
        "claude",
        "cursor",
        "codex"
    ];
    if (!allowedProfiles.includes(value)) {
        throw new Error(`Invalid profile "${value}". Allowed profiles: ${allowedProfiles.join(", ")}.`);
    }
    return value;
}
function formatCount(count) {
    return count === 1 ? "1 item" : `${count} items`;
}
