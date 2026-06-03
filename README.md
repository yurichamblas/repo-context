# repo-context

Generate clean, LLM-ready context files for any codebase.

> Stop sending your entire repository to AI. Send only the context that matters.

## Why?

AI coding assistants work better when they understand your repository. But most
workflows start by dumping too much code into the model, which means:

- unnecessary token usage
- slower AI responses
- noisy context
- higher cost
- lower accuracy
- privacy concerns

`repo-context` takes a different approach:

- scans your repository **locally**
- detects stack, package managers, commands, environment variables and important files
- generates a compact Markdown context file
- **does not** call any AI model
- **does not** require an API key
- **does not** spend tokens

> repo dump is not repo context.

## Try it (no install)

```bash
npx @yurichamblas/repo-context generate
```

(The first run asks to confirm the download. Add args like
`npx @yurichamblas/repo-context generate --profile claude`.)

You can also run it straight from GitHub without npm:

```bash
npx github:yurichamblas/repo-context generate
```

## Install

```bash
npm install -g @yurichamblas/repo-context
repo-context generate
```

The command installed is `repo-context`. Or, from GitHub — clone and link
(reliable on every platform):

```bash
git clone https://github.com/yurichamblas/repo-context
cd repo-context
npm install
npm install -g .          # or: npm link
repo-context generate
```

> Heads-up: `npm install -g github:yurichamblas/repo-context` does **not** work —
> npm omits the prebuilt `dist/` when installing a *git* dependency globally. Use
> `npx` or the clone-and-link method above instead.

## Development

```bash
npm install
npm run dev -- generate          # run from source via tsx
npm run build                    # compile to dist/
```

## Usage

```bash
repo-context generate
```

This creates:

```txt
repo-context.md
```

Then paste that file into ChatGPT, Claude, Cursor, Codex, Windsurf, or any AI
coding assistant.

## Options

```bash
repo-context generate --root <path>          # repository to scan (default: cwd)
repo-context generate --output context.md    # output file (default: repo-context.md)
repo-context generate --max-depth 5          # folder tree depth (default: 4)
repo-context generate --profile claude       # default | claude | cursor | codex
```

Examples:

```bash
repo-context generate --output context.md
repo-context generate --max-depth 5
repo-context generate --profile claude
repo-context generate --profile cursor
repo-context generate --profile codex
```

## What it detects

- **Stack**: Node.js, TypeScript, React, Next.js, Vite, Vue, Angular, Express,
  Fastify, NestJS, Python, FastAPI, Django, Flask, Docker, Docker Compose,
  Rust, Go, .NET / C#, WPF/XAML, Revit add-ins.
- **Package managers**: npm, pnpm, Yarn, pip, Cargo.
- **Commands**: `package.json` scripts, `Makefile` targets, Docker Compose.
- **Environment variables**: keys from `.env.example` and `.env.sample` only.
- **Important files**: README, manifests, configs, and project files.
- **Folder structure**: a compact tree that respects `.gitignore` and ignores
  noisy/generated folders.

### Monorepo-aware

Detection runs **recursively**, so polyglot monorepos are covered: a nested
`frontend/package.json`, `backend/requirements.txt`, or `service/*.csproj` all
contribute to the stack, commands, important files and environment variables —
each command is shown with the subfolder to run it from. Noisy folders
(`node_modules`, `dist`, `build`, `__pycache__`, temp/scratch dirs, agent
worktrees, …) are pruned at any depth.

## Privacy

- Runs entirely on your machine.
- Never reads `.env` (only `.env.example` / `.env.sample`).
- Never reads binary files or source code contents.
- Never calls an external API or LLM.

## Philosophy

This tool does not dump your entire codebase. It creates useful, compact,
structured context.

## License

MIT
