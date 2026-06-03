import fg from "fast-glob";
import { IMPORTANT_FILE_PATTERNS, SCAN_IGNORE_GLOBS } from "../config/defaults.js";
export async function scanImportantFiles(rootDir) {
    // Match each pattern recursively so nested manifests/configs in a monorepo
    // (e.g. frontend/package.json, Backend_Python/pyproject.toml) are included.
    const patterns = IMPORTANT_FILE_PATTERNS.map((pattern) => `**/${pattern}`);
    const files = await fg(patterns, {
        cwd: rootDir,
        onlyFiles: true,
        dot: true,
        ignore: SCAN_IGNORE_GLOBS
    });
    // Case-insensitive filesystems can resolve one file via multiple patterns of
    // differing case (README.md / readme.md). Collapse by lowercased path.
    const byKey = new Map();
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
function getReason(filePath) {
    const lower = filePath.toLowerCase();
    if (lower.endsWith("readme.md"))
        return "Documentation.";
    if (lower.endsWith("package.json"))
        return "Node.js metadata, dependencies and scripts.";
    if (lower.endsWith("pnpm-workspace.yaml"))
        return "pnpm workspace definition.";
    if (lower.endsWith("turbo.json"))
        return "Turborepo monorepo configuration.";
    if (lower.endsWith("nx.json"))
        return "Nx monorepo configuration.";
    if (lower.endsWith("lerna.json"))
        return "Lerna monorepo configuration.";
    if (lower.endsWith("pyproject.toml"))
        return "Python project configuration.";
    if (lower.endsWith("requirements.txt"))
        return "Python dependencies.";
    if (lower.endsWith("pipfile"))
        return "Python dependencies (pipenv).";
    if (lower.endsWith("poetry.lock"))
        return "Pinned Python dependencies (Poetry).";
    if (lower.endsWith("cargo.toml"))
        return "Rust crate manifest.";
    if (lower.endsWith("go.mod"))
        return "Go module definition.";
    if (lower.endsWith("dockerfile"))
        return "Container build definition.";
    if (lower.includes("docker-compose") || lower.endsWith("compose.yml") || lower.endsWith("compose.yaml"))
        return "Local multi-service runtime configuration.";
    if (lower.endsWith("makefile"))
        return "Common project commands.";
    if (lower.endsWith(".env.example"))
        return "Template for required environment variables.";
    if (lower.endsWith(".env.sample"))
        return "Template for required environment variables.";
    if (lower.endsWith(".sln"))
        return ".NET solution file.";
    if (lower.endsWith(".csproj"))
        return ".NET/C# project file.";
    if (lower.endsWith(".fsproj"))
        return ".NET/F# project file.";
    if (lower.endsWith(".vbproj"))
        return ".NET/VB project file.";
    if (lower.endsWith(".addin"))
        return "Revit add-in manifest.";
    if (lower.endsWith("tsconfig.json"))
        return "TypeScript compiler configuration.";
    if (lower.includes("vite.config"))
        return "Vite build configuration.";
    if (lower.includes("next.config"))
        return "Next.js configuration.";
    return "Potentially important project file.";
}
