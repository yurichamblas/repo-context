import fs from "node:fs/promises";
import path from "node:path";
import type { GenerateOptions, RepoContext } from "./types.js";
import { getProjectName } from "./utils/path.js";
import { scanStack } from "./scanners/stackScanner.js";
import { scanCommands } from "./scanners/commandScanner.js";
import { scanEnvironmentVariables } from "./scanners/envScanner.js";
import { scanImportantFiles } from "./scanners/importantFilesScanner.js";
import { scanFileTree } from "./scanners/fileTreeScanner.js";
import { renderMarkdown } from "./renderers/markdownRenderer.js";

export async function generateRepoContext(options: GenerateOptions): Promise<{
  outputPath: string;
  context: RepoContext;
}> {
  const rootDir = path.resolve(options.rootDir);

  const rootStat = await fs.stat(rootDir).catch(() => null);
  if (!rootStat || !rootStat.isDirectory()) {
    throw new Error(`Root path is not a directory: ${rootDir}`);
  }

  const outputPath = path.resolve(rootDir, options.output);

  const [
    stackResult,
    commands,
    environmentVariables,
    importantFiles,
    folderTree
  ] = await Promise.all([
    scanStack(rootDir),
    scanCommands(rootDir),
    scanEnvironmentVariables(rootDir),
    scanImportantFiles(rootDir),
    scanFileTree(rootDir, options.maxDepth)
  ]);

  const context: RepoContext = {
    projectName: getProjectName(rootDir),
    rootPath: rootDir,
    generatedAt: new Date().toISOString(),
    detectedStack: stackResult.detectedStack,
    packageManagers: stackResult.packageManagers,
    folderTree,
    importantFiles,
    commands,
    environmentVariables,
    notes: buildNotes({
      detectedStack: stackResult.detectedStack,
      commandsCount: commands.length,
      envCount: environmentVariables.length
    })
  };

  const markdown = renderMarkdown(context, options.profile);

  await fs.writeFile(outputPath, markdown, "utf8");

  return {
    outputPath,
    context
  };
}

function buildNotes(input: {
  detectedStack: string[];
  commandsCount: number;
  envCount: number;
}): string[] {
  const notes: string[] = [];

  if (input.detectedStack.length === 0) {
    notes.push(
      "No stack was confidently detected. Consider adding README.md or standard config files."
    );
  }

  if (input.commandsCount === 0) {
    notes.push(
      "No runnable commands were detected from package.json, Makefile or Docker Compose."
    );
  }

  if (input.envCount === 0) {
    notes.push(
      "No environment variables were detected. Add .env.example to document required configuration."
    );
  }

  notes.push(
    "This context was generated locally without an AI model. No source code contents were included."
  );

  return notes;
}
