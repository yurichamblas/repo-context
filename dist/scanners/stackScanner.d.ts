export declare function scanStack(rootDir: string): Promise<{
    detectedStack: string[];
    packageManagers: string[];
}>;
