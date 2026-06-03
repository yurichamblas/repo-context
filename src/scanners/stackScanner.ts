import path from "node:path";
import fg from "fast-glob";
import { readJsonFile, readTextFile } from "../utils/file.js";
import { SCAN_IGNORE_GLOBS } from "../config/defaults.js";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function scanStack(rootDir: string): Promise<{
  detectedStack: string[];
  packageManagers: string[];
}> {
  const stack = new Set<string>();
  const packageManagers = new Set<string>();

  // One traversal to find every relevant manifest anywhere in the repo.
  const signalFiles = await fg(
    [
      "**/package.json",
      "**/tsconfig.json",
      "**/pyproject.toml",
      "**/requirements.txt",
      "**/requirements-*.txt",
      "**/Pipfile",
      "**/poetry.lock",
      "**/package-lock.json",
      "**/pnpm-lock.yaml",
      "**/yarn.lock",
      "**/Cargo.toml",
      "**/go.mod",
      "**/Dockerfile",
      "**/docker-compose.yml",
      "**/docker-compose.yaml",
      "**/compose.yml",
      "**/compose.yaml",
      "**/*.sln",
      "**/*.csproj",
      "**/*.fsproj",
      "**/*.vbproj",
      "**/*.xaml",
      "**/*.addin"
    ],
    { cwd: rootDir, ignore: SCAN_IGNORE_GLOBS, onlyFiles: true, dot: false }
  );

  const packageJsonPaths: string[] = [];
  const pythonManifestPaths: string[] = [];

  for (const relativePath of signalFiles) {
    const base = path.basename(relativePath).toLowerCase();
    const ext = path.extname(relativePath).toLowerCase();

    if (base === "package.json") {
      stack.add("Node.js");
      packageJsonPaths.push(relativePath);
    } else if (base === "tsconfig.json") {
      stack.add("TypeScript");
    } else if (base === "package-lock.json") {
      packageManagers.add("npm");
    } else if (base === "pnpm-lock.yaml") {
      packageManagers.add("pnpm");
    } else if (base === "yarn.lock") {
      packageManagers.add("Yarn");
    } else if (base === "pyproject.toml") {
      stack.add("Python");
      pythonManifestPaths.push(relativePath);
    } else if (
      base === "requirements.txt" ||
      base.startsWith("requirements-") ||
      base === "pipfile"
    ) {
      stack.add("Python");
      packageManagers.add("pip");
      pythonManifestPaths.push(relativePath);
    } else if (base === "poetry.lock") {
      stack.add("Python");
      packageManagers.add("Poetry");
    } else if (base === "cargo.toml") {
      stack.add("Rust");
      packageManagers.add("Cargo");
    } else if (base === "go.mod") {
      stack.add("Go");
    } else if (base === "dockerfile") {
      stack.add("Docker");
    } else if (
      base === "docker-compose.yml" ||
      base === "docker-compose.yaml" ||
      base === "compose.yml" ||
      base === "compose.yaml"
    ) {
      stack.add("Docker Compose");
    } else if (ext === ".sln" || ext === ".csproj") {
      stack.add(".NET");
      stack.add("C#");
    } else if (ext === ".fsproj") {
      stack.add(".NET");
      stack.add("F#");
    } else if (ext === ".vbproj") {
      stack.add(".NET");
      stack.add("VB.NET");
    } else if (ext === ".xaml") {
      stack.add("WPF/XAML");
    } else if (ext === ".addin") {
      stack.add("Revit Add-in");
    }
  }

  // Inspect package.json dependencies to detect JS/TS frameworks.
  await Promise.all(
    packageJsonPaths.map(async (relativePath) => {
      const packageJson = await readJsonFile<PackageJson>(
        path.join(rootDir, relativePath)
      );
      if (!packageJson) return;

      const deps: Record<string, string> = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      if (deps.react) stack.add("React");
      if (deps.next) stack.add("Next.js");
      if (deps.vue) stack.add("Vue");
      if (deps["@angular/core"]) stack.add("Angular");
      if (deps.svelte) stack.add("Svelte");
      if (deps.vite) stack.add("Vite");
      if (deps.typescript || deps["ts-node"]) stack.add("TypeScript");
      if (deps.express) stack.add("Express");
      if (deps.fastify) stack.add("Fastify");
      if (deps["@nestjs/core"]) stack.add("NestJS");
    })
  );

  // Inspect Python manifests to detect web frameworks (case-insensitive).
  await Promise.all(
    pythonManifestPaths.map(async (relativePath) => {
      const content = (
        await readTextFile(path.join(rootDir, relativePath))
      )?.toLowerCase();
      if (!content) return;

      if (content.includes("fastapi")) stack.add("FastAPI");
      if (content.includes("django")) stack.add("Django");
      if (content.includes("flask")) stack.add("Flask");
    })
  );

  return {
    detectedStack: Array.from(stack).sort(),
    packageManagers: Array.from(packageManagers).sort()
  };
}
