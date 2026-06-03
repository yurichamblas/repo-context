# repo-context

> Stop sending your entire repository to AI. Send only the context that matters.

[![npm version](https://img.shields.io/npm/v/@yuri_chamblas/repo-context.svg)](https://www.npmjs.com/package/@yuri_chamblas/repo-context)
[![npm downloads](https://img.shields.io/npm/dm/@yuri_chamblas/repo-context.svg)](https://www.npmjs.com/package/@yuri_chamblas/repo-context)
[![node](https://img.shields.io/node/v/@yuri_chamblas/repo-context.svg)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@yuri_chamblas/repo-context.svg)](LICENSE)

A local-first CLI that scans your codebase and generates a compact, structured,
**LLM-ready** `repo-context.md` — the stack, commands, important files and
environment variables that matter — without ever calling an AI model.

- 🔒 **Local-first** — runs on your machine, no API key, no tokens, no network calls to any LLM
- 🧭 **Monorepo-aware** — detects nested apps (frontend + backend + plugins) recursively
- 🧹 **Compact** — prunes `node_modules`, build output, temp/scratch dirs and binaries
- 🔐 **Safe** — never reads `.env` or your source code contents (only `.env.example` / `.env.sample`)
- ⚡ **Fast** — a typical scan finishes in a second or two

> repo dump is not repo context.

## Quick start

No install needed — just run it in any project:

```bash
npx @yuri_chamblas/repo-context generate
```

This creates `repo-context.md` in the current folder. Paste it into ChatGPT,
Claude, Cursor, Codex, Windsurf, or any AI coding assistant — and skip the
copy-paste-the-whole-repo dance.

## Example output

Running it on a small Next.js app produces:

````markdown
# Repository Context

## Project

- Name: `acme-app`
- Generated at: `2026-06-03T22:06:48.137Z`

## Detected Stack

- Docker
- Next.js
- Node.js
- React
- TypeScript

## Package Managers

- npm

## Folder Structure

```txt
.
├── src/
│   ├── app/
│   │   └── page.tsx
│   └── lib/
│       └── db.ts
├── .env.example
├── Dockerfile
├── next.config.mjs
├── package.json
└── README.md
```

## Important Files

- `.env.example`: Template for required environment variables.
- `Dockerfile`: Container build definition.
- `next.config.mjs`: Next.js configuration.
- `package.json`: Node.js metadata, dependencies and scripts.

## Available Commands

- `npm run dev` from `package.json` — next dev
- `npm run build` from `package.json` — next build
- `npm run test` from `package.json` — vitest

## Environment Variables

- `DATABASE_URL`
- `NEXT_PUBLIC_API_URL`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`

## Suggested AI Prompt

```txt
You are helping me work on this repository. Use the following context to
understand the project structure, stack, commands, and important files
before suggesting changes...
```
````

(Trimmed for brevity — the real file also includes a Purpose and Notes section.)

## Install

To get a permanent `repo-context` command:

```bash
npm install -g @yuri_chamblas/repo-context
repo-context generate
```

### Other ways to install

**Straight from GitHub (no npm package needed):**

```bash
npx github:yurichamblas/repo-context generate
```

**Clone and link (for hacking on it):**

```bash
git clone https://github.com/yurichamblas/repo-context
cd repo-context
npm install
npm install -g .          # or: npm link
```

> Note: `npm install -g github:yurichamblas/repo-context` does **not** work — npm
> drops the prebuilt `dist/` when installing a git dependency globally. Use the
> npm package, `npx`, or clone-and-link instead.

## Usage

```bash
repo-context generate [options]
```

| Option | Description | Default |
| --- | --- | --- |
| `-r, --root <path>` | Repository to scan | current directory |
| `-o, --output <file>` | Output Markdown file | `repo-context.md` |
| `-d, --max-depth <n>` | Folder-tree depth | `4` |
| `-p, --profile <name>` | Prompt profile: `default` `claude` `cursor` `codex` | `default` |

```bash
# scan another repo, write a custom file, tighter tree, Claude-tuned prompt
repo-context generate --root ../my-api --output api-context.md --max-depth 3 --profile claude
```

### Profiles

The whole context is identical across profiles — only the **Suggested AI Prompt**
section changes to suit the assistant:

- **`default`** — general-purpose.
- **`claude`** — asks Claude to reason about relevant files before editing.
- **`cursor`** — emphasizes project-level guidance and small, focused changes.
- **`codex`** — emphasizes minimal, safe, testable changes for coding agents.

## What it detects

- **Stack** — Node.js, TypeScript, React, Next.js, Vite, Vue, Angular, Express,
  Fastify, NestJS, Svelte, Python, FastAPI, Django, Flask, Docker, Docker
  Compose, Rust, Go, .NET / C# / F# / VB, WPF/XAML, Revit add-ins.
- **Package managers** — npm, pnpm, Yarn, pip, Poetry, Cargo.
- **Commands** — `package.json` scripts, `Makefile` targets, Docker Compose
  (each shown with the subfolder to run it from).
- **Environment variables** — keys from `.env.example` / `.env.sample` only.
- **Important files** — READMEs, manifests, configs and project files.
- **Folder structure** — a tree that respects `.gitignore` and prunes noise.

### Monorepo-aware

Detection runs **recursively**, so polyglot monorepos are fully covered: a
nested `frontend/package.json`, `backend/requirements.txt`, or
`plugin/*.csproj` all feed the stack, commands, important files and environment
variables. Noisy folders (`node_modules`, `dist`, `build`, `__pycache__`,
temp/scratch dirs, agent worktrees, …) are pruned at any depth.

## Privacy

- Runs entirely on your machine — no API key, no tokens, no LLM calls.
- **Never** reads `.env` (only `.env.example` / `.env.sample`).
- Never reads binary files or source code contents — only metadata, paths,
  commands, env-var names and project signals.

## Contributing

Issues and PRs welcome at
[github.com/yurichamblas/repo-context](https://github.com/yurichamblas/repo-context).

```bash
git clone https://github.com/yurichamblas/repo-context
cd repo-context
npm install
npm run dev -- generate     # run from source via tsx
npm run build               # compile to dist/
npm run check               # type-check
```

## License

[MIT](LICENSE) © Yuri Chamblas
