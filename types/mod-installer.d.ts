import { ModEntry, ModEntryLocal, ModEntryLocalVirtual, ModEntryServer } from './types';
export declare class InstallQueue {
    private static queue;
    static changeUpdate(): void;
    static add(...mods: ModEntryServer[]): void;
    static delete(mod: ModEntryServer): void;
    static clear(): void;
    static has(mod: ModEntry): ModEntryServer | undefined;
    static values(): ModEntryServer[];
}
export declare class ModInstaller {
    static record: Record<string, ModEntryServer>;
    static byNameRecord: Record<string, ModEntryServer>;
    static virtualMods: Record<string, ModEntryLocalVirtual>;
    static init(): void;
    private static getModByDepName;
    private static setOrAddNewer;
    private static getModDependencies;
    private static matchesVersionReqRanges;
    static findDepsDatabase(mods: ModEntryServer[], modRecords: Record<string, ModEntryServer[]>, includeInstalled?: boolean): Promise<ModEntryServer[]>;
    static install(mods: ModEntryServer[]): Promise<void>;
    private static updateMod;
    private static downloadAndInstallMod;
    private static installCCMod;
    private static checkSHA256;
    private static installModZip;
    private static installCCLoader;
    private static fileExists;
    static isDirGit(dirPath: string): Promise<boolean>;
    static getWhatDependsOnAMod(mod: ModEntryLocal, on?: boolean): ModEntryLocal[];
    static uninstallMod(mod: ModEntryLocal): Promise<void>;
    static restartGame(): void;
    static checkLocalModForUpdate(mod: ModEntryLocal): boolean;
    static appendToUpdateModsToQueue(): Promise<boolean>;
    static checkAllLocalModsForUpdate(): Promise<void>;
}
