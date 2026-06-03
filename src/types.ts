export type OutputProfile = "default" | "claude" | "cursor" | "codex";

export interface GenerateOptions {
  rootDir: string;
  output: string;
  maxDepth: number;
  profile: OutputProfile;
}

export interface RepoContext {
  projectName: string;
  rootPath: string;
  generatedAt: string;
  detectedStack: string[];
  packageManagers: string[];
  folderTree: string;
  importantFiles: ImportantFile[];
  commands: CommandInfo[];
  environmentVariables: string[];
  notes: string[];
}

export interface ImportantFile {
  path: string;
  reason: string;
}

export interface CommandInfo {
  source: string;
  command: string;
  description?: string;
}
