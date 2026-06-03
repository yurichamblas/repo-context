export declare function fileExists(filePath: string): Promise<boolean>;
export declare function readTextFile(filePath: string): Promise<string | null>;
export declare function readJsonFile<T>(filePath: string): Promise<T | null>;
export declare function resolveFromRoot(rootDir: string, relativePath: string): string;
