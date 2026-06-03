import type { GenerateOptions, RepoContext } from "./types.js";
export declare function generateRepoContext(options: GenerateOptions): Promise<{
    outputPath: string;
    context: RepoContext;
}>;
