import { ModEntry, ModEntryLocal, ModEntryServer, NPDatabase } from './types';
export declare class ModDB {
    url: string;
    active: boolean;
    private static localStorageKey;
    private static databasesLoaded;
    static databases: Record<string, ModDB>;
    static modRecord: Record<string, ModEntryServer[]>;
    static addDatabase(db: ModDB): void;
    static loadDatabases(force?: boolean): void;
    static repoURLToFileName(url: string): string;
    static minifyRepoURL(url: string): string;
    static expandRepoURL(url: string): string;
    static saveDatabases(): void;
    static loadAllMods(callback?: () => void, prefferCache?: boolean): Promise<void>;
    static getHighestVersionMod<T extends ModEntry>(mods: T[]): T;
    static resolveLocalModOrigin(mod: ModEntryLocal): Promise<void>;
    static removeModDuplicates(modsRecord: Record<string, ModEntryServer[]>): Record<string, ModEntryServer>;
    name: string;
    database: NPDatabase;
    modRecord: Record<string, ModEntryServer>;
    constructor(url: string, active?: boolean, prepare?: boolean);
    isUrlValid(): Promise<boolean>;
    private createModEntriesFromDatabase;
    getMods(callback: (mods: ModEntryServer[]) => void): Promise<void>;
}
