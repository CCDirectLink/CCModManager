export declare function isDirectory(path: string): Promise<boolean>;
export declare function getFilesRecursive(dir: string): AsyncIterable<string>;
export declare function mkdirRecursive(dir: string, noRecurse?: boolean): Promise<void>;
export declare function removeDirRecursive(path: string): Promise<void>;
export declare function fileExists(filePath: string): Promise<boolean>;
export declare function isDirGit(dirPath: string): Promise<boolean>;
export declare const readFile: typeof import("node:fs/promises").readFile;
export declare const writeFile: typeof import("node:fs/promises").writeFile;
