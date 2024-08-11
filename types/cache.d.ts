import { ModEntry, ModImageConfig as ModIconConfig, NPDatabase } from './types';
export declare class FileCache {
    private static cacheDir;
    private static inCache;
    private static cache;
    static _isThereInternet: boolean | undefined;
    static isThereInternet(force?: boolean): Promise<boolean>;
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
    private static getIcon;
    private static downloadAndWriteDatabase;
    static checkDatabaseUrl(url: string): Promise<boolean>;
    static getDatabase(name: string, create: (database: NPDatabase) => void): Promise<void>;
    private static getCachedFile;
    static deleteOnDiskCache(): Promise<void>;
}
