export const DEFAULT_OUTPUT_FILE = "repo-context.md";
export const DEFAULT_MAX_DEPTH = 4;
// Directory names treated as noise and ignored at any depth.
export const IGNORE_DIRS = [
    ".git",
    "node_modules",
    "dist",
    "build",
    "out",
    "bin",
    "obj",
    "target",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".cache",
    ".parcel-cache",
    ".turbo",
    "coverage",
    ".nyc_output",
    ".venv",
    "venv",
    ".tox",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".idea",
    ".vscode",
    ".vs",
    ".claude",
    ".codex",
    "logs",
    "log"
];
// Temp/scratch directory bases. Matched precisely (the name itself or a
// `_`/`-` separated variant, optionally dot-prefixed) so real dirs like
// `templates/` or `tmpl/` are never pruned. Catches tmp/, tmp_canary/,
// tmp-buildlogs/, .tmp_model_metadata/, temp/, temp_x/, etc.
export const NOISE_DIR_BASES = ["tmp", "temp"];
function noiseDirNames(base) {
    return [base, `.${base}`].flatMap((name) => [name, `${name}_*`, `${name}-*`]);
}
const NOISE_DIR_NAMES = NOISE_DIR_BASES.flatMap(noiseDirNames);
// File globs (media / binaries / large artifacts) ignored at any depth.
export const IGNORE_FILE_GLOBS = [
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.webp",
    "*.ico",
    "*.bmp",
    "*.svg",
    "*.mp4",
    "*.mov",
    "*.avi",
    "*.webm",
    "*.mp3",
    "*.wav",
    "*.pdf",
    "*.zip",
    "*.tar",
    "*.gz",
    "*.tgz",
    "*.7z",
    "*.rar",
    "*.dll",
    "*.exe",
    "*.so",
    "*.dylib",
    "*.pdb",
    "*.bin",
    "*.chm",
    "*.msi"
];
// Patterns for the `ignore` library (folder tree). Gitignore semantics:
// a bare name matches at any depth; a trailing slash matches directories only.
export const DEFAULT_IGNORE_PATTERNS = [
    ...IGNORE_DIRS,
    ...NOISE_DIR_NAMES.map((name) => `${name}/`),
    ...IGNORE_FILE_GLOBS,
    "*.log",
    ".env"
];
// Patterns for fast-glob (scanners). Must be explicitly recursive so nested
// node_modules/dist/etc. inside a monorepo are pruned too.
export const SCAN_IGNORE_GLOBS = [
    ...IGNORE_DIRS.map((dir) => `**/${dir}/**`),
    ...NOISE_DIR_NAMES.map((name) => `**/${name}/**`),
    ...IGNORE_FILE_GLOBS.map((glob) => `**/${glob}`),
    "**/*.log"
];
// Files worth calling out; matched recursively across the repo.
export const IMPORTANT_FILE_PATTERNS = [
    "README.md",
    "readme.md",
    "package.json",
    "pnpm-workspace.yaml",
    "turbo.json",
    "nx.json",
    "lerna.json",
    "pyproject.toml",
    "requirements.txt",
    "Pipfile",
    "poetry.lock",
    "Cargo.toml",
    "go.mod",
    "Dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
    "Makefile",
    "*.sln",
    "*.csproj",
    "*.fsproj",
    "*.vbproj",
    "*.addin",
    ".env.example",
    ".env.sample",
    "tsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mjs",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts"
];
