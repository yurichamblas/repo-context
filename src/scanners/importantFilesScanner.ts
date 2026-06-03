import fg from "fast-glob";
import type { ImportantFile } from "../types.js";
import {
  IMPORTANT_FILE_PATTERNS,
  DEFAULT_IGNORE_PATTERNS
} from "../config/defaults.js";

export async function scanImportantFiles(
  rootDir: string
): Promise<ImportantFile[]> {
  const files = await fg(IMPORTANT_FILE_PATTERNS, {
    cwd: rootDir,
    onlyFiles: true,
    dot: true,
    ignore: DEFAULT_IGNORE_PATTERNS
  });

  // Case-insensitive filesystems (Windows/macOS) can resolve a single file via
  // multiple patterns of differing case (e.g. README.md and readme.md both hit
  // the same file). Collapse those by lowercased path, keeping a deterministic
  // representative, so the output never lists the same file twice.
  const byKey = new Map<string, string>();
  for (const file of files) {
    const key = file.toLowerCase();
    const existing = byKey.get(key);
    if (existing === undefined || file < existing) {
      byKey.set(key, file);
    }
  }

  const unique = Array.from(byKey.values()).sort();

  return unique.map((file) => ({
    path: file,
    reason: getReason(file)
  }));
}

function getReason(filePath: string): string {
  const lower = filePath.toLowerCase();

  if (lower.endsWith("readme.md")) return "Main project documentation.";
  if (lower.endsWith("package.json"))
    return "Node.js metadata, dependencies and scripts.";
  if (lower.endsWith("pyproject.toml")) return "Python project configuration.";
  if (lower.endsWith("requirements.txt")) return "Python dependencies.";
  if (lower.endsWith("pipfile")) return "Python dependencies (pipenv).";
  if (lower.endsWith("poetry.lock")) return "Pinned Python dependencies (Poetry).";
  if (lower.endsWith("cargo.toml")) return "Rust crate manifest.";
  if (lower.endsWith("go.mod")) return "Go module definition.";
  if (lower.endsWith("dockerfile")) return "Container build definition.";
  if (lower.includes("docker-compose"))
    return "Local multi-service runtime configuration.";
  if (lower.endsWith("makefile")) return "Common project commands.";
  if (lower.endsWith(".env.example"))
    return "Template for required environment variables.";
  if (lower.endsWith(".env.sample"))
    return "Template for required environment variables.";
  if (lower.endsWith(".sln")) return ".NET solution file.";
  if (lower.endsWith(".csproj")) return ".NET/C# project file.";
  if (lower.endsWith(".fsproj")) return ".NET/F# project file.";
  if (lower.endsWith(".vbproj")) return ".NET/VB project file.";
  if (lower.endsWith(".addin")) return "Revit add-in manifest.";
  if (lower.endsWith("tsconfig.json"))
    return "TypeScript compiler configuration.";
  if (lower.includes("vite.config")) return "Vite build configuration.";
  if (lower.includes("next.config")) return "Next.js configuration.";

  return "Potentially important project file.";
}
