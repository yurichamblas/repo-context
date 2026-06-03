import path from "node:path";
import fg from "fast-glob";
import { fileExists, readJsonFile, readTextFile } from "../utils/file.js";

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

  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = await readJsonFile<PackageJson>(packageJsonPath);

  if (packageJson) {
    stack.add("Node.js");

    const deps: Record<string, string> = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    if (deps.react) stack.add("React");
    if (deps.next) stack.add("Next.js");
    if (deps.vue) stack.add("Vue");
    if (deps["@angular/core"]) stack.add("Angular");
    if (deps.vite) stack.add("Vite");
    if (deps.typescript) stack.add("TypeScript");
    if (deps.express) stack.add("Express");
    if (deps.fastify) stack.add("Fastify");
    if (deps["@nestjs/core"]) stack.add("NestJS");
  }

  if (await fileExists(path.join(rootDir, "package-lock.json"))) {
    packageManagers.add("npm");
  }

  if (await fileExists(path.join(rootDir, "pnpm-lock.yaml"))) {
    packageManagers.add("pnpm");
  }

  if (await fileExists(path.join(rootDir, "yarn.lock"))) {
    packageManagers.add("Yarn");
  }

  if (await fileExists(path.join(rootDir, "requirements.txt"))) {
    stack.add("Python");
    packageManagers.add("pip");
  }

  if (await fileExists(path.join(rootDir, "pyproject.toml"))) {
    stack.add("Python");
  }

  const pyproject = (
    await readTextFile(path.join(rootDir, "pyproject.toml"))
  )?.toLowerCase();
  if (pyproject?.includes("fastapi")) stack.add("FastAPI");
  if (pyproject?.includes("django")) stack.add("Django");
  if (pyproject?.includes("flask")) stack.add("Flask");

  const requirements = (
    await readTextFile(path.join(rootDir, "requirements.txt"))
  )?.toLowerCase();
  if (requirements?.includes("fastapi")) stack.add("FastAPI");
  if (requirements?.includes("django")) stack.add("Django");
  if (requirements?.includes("flask")) stack.add("Flask");

  if (await fileExists(path.join(rootDir, "Dockerfile"))) {
    stack.add("Docker");
  }

  if (
    (await fileExists(path.join(rootDir, "docker-compose.yml"))) ||
    (await fileExists(path.join(rootDir, "docker-compose.yaml")))
  ) {
    stack.add("Docker Compose");
  }

  if (await fileExists(path.join(rootDir, "Cargo.toml"))) {
    stack.add("Rust");
    packageManagers.add("Cargo");
  }

  if (await fileExists(path.join(rootDir, "go.mod"))) {
    stack.add("Go");
  }

  const dotnetFiles = await fg(["**/*.sln", "**/*.csproj"], {
    cwd: rootDir,
    ignore: ["node_modules/**", "bin/**", "obj/**", ".git/**"],
    onlyFiles: true
  });

  if (dotnetFiles.length > 0) {
    stack.add(".NET");
    stack.add("C#");
  }

  const xamlFiles = await fg(["**/*.xaml"], {
    cwd: rootDir,
    ignore: ["bin/**", "obj/**", ".git/**", "node_modules/**"],
    onlyFiles: true
  });

  if (xamlFiles.length > 0) {
    stack.add("WPF/XAML");
  }

  const addinFiles = await fg(["**/*.addin"], {
    cwd: rootDir,
    ignore: ["bin/**", "obj/**", ".git/**", "node_modules/**"],
    onlyFiles: true
  });

  if (addinFiles.length > 0) {
    stack.add("Revit Add-in");
  }

  return {
    detectedStack: Array.from(stack).sort(),
    packageManagers: Array.from(packageManagers).sort()
  };
}
