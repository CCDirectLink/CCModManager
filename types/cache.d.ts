import type { ModEntry, ModImageConfig as ModIconConfig, NPDatabase } from './types';
export declare class FileCache {
    private static cacheDir;
    private static existsOnDisk;
    private static readingPromises;
    static getDefaultModIconConfig(): {
        path: string;
        offsetX: number;
        offsetY: number;
        sizeX: number;
        sizeY: number;
    };
    static init(): Promise<void>;
    static prepareDatabase(name: string): void;
    static getIconConfig(mod: ModEntry): Promise<ModIconConfig>;
    private static saveFile;
    private static fetchAndWriteIcon;
    private static getIcon;
    static checkDatabaseUrl(url: string): Promise<boolean>;
    private static isJsonDatabase;
    private static readDatabaseFromDisk;
    private static fetchDatabase;
    static getDatabase(name: string): Promise<{
        database?: NPDatabase;
        checked: boolean;
    }>;
    static deleteOnDiskCache(): Promise<void>;
}
