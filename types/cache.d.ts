import { ModEntry, ModImageConfig as ModIconConfig, NPDatabase } from './types';
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
    private static getIcon;
    static checkDatabaseUrl(url: string): Promise<boolean>;
    static getDatabase(name: string): Promise<NPDatabase>;
    static deleteOnDiskCache(): Promise<void>;
}
