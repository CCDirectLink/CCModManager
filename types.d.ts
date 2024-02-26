declare module "moddb" {
    import { ModEntry, ModEntryLocal, ModEntryServer, NPDatabase } from './types';
    export class ModDB {
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
}
declare module "cache" {
    import { ModEntry, ModImageConfig as ModIconConfig, NPDatabase } from './types';
    export class FileCache {
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
    }
}
declare module "gui/install-dialogs" {
    import { ModEntryLocal } from '../types';
    export function prepareModName(name: string): string;
    export class ModInstallDialogs {
        static showModInstallDialog(): void;
        static showAutoUpdateDialog(): void;
        static showModUninstallDialog(localMod: ModEntryLocal): void;
        static checkCanDisableMod(mod: ModEntryLocal): boolean;
        static checkCanEnableMod(mod: ModEntryLocal): Promise<ModEntryLocal[] | undefined>;
    }
}
declare module "mod-installer" {
    import { ModEntry, ModEntryLocal, ModEntryServer } from './types';
    export class InstallQueue {
        private static queue;
        static changeUpdate(): void;
        static add(...mods: ModEntryServer[]): void;
        static delete(mod: ModEntryServer): void;
        static clear(): void;
        static has(mod: ModEntry): ModEntryServer | undefined;
        static values(): ModEntryServer[];
    }
    export class ModInstaller {
        static record: Record<string, ModEntryServer>;
        static byNameRecord: Record<string, ModEntryServer>;
        static virtualMods: Record<string, ModEntryLocal>;
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
        private static installModZip;
        static getWhatDependsOnAMod(mod: ModEntryLocal, on?: boolean): ModEntryLocal[];
        static uninstallMod(mod: ModEntryLocal): Promise<boolean>;
        static restartGame(): void;
        static checkLocalModForUpdate(mod: ModEntryLocal): boolean;
        static appendToUpdateModsToQueue(): Promise<boolean>;
        static checkAllLocalModsForUpdate(): Promise<void>;
    }
}
declare module "gui/list-entry-highlight" {
    export {};
    global {
        namespace sc {
            interface ModListEntryHighlight extends ig.GuiElementBase {
                gfx: ig.Image;
                ninepatch: ig.NinePatch;
                buttonCover: ig.NinePatch;
                textWidth: number;
                buttonWidth: number;
                highLightOffsetY: number;
                textTag: ig.ImagePattern;
                textTagHighlighted: ig.ImagePattern;
                focus: boolean;
                updateWidth(this: this, width: number, textWidth: number): void;
            }
            interface ModListEntryHighlightConstructor extends ImpactClass<ModListEntryHighlight> {
                new (width: number, height: number, textWidth: number, buttonWidth: number): ModListEntryHighlight;
            }
            var ModListEntryHighlight: ModListEntryHighlightConstructor;
        }
    }
}
declare module "gui/list-entry" {
    import { ModEntry, ModEntryLocal } from '../types';
    import "gui/list-entry-highlight";
    global {
        namespace sc {
            interface ModListEntry extends ig.FocusGui, sc.Model.Observer {
                ninepatch: ig.NinePatch;
                mod: ModEntry;
                iconOffset: number;
                nameIconPrefixesText: sc.TextGui;
                nameText: sc.TextGui;
                description: sc.TextGui;
                versionText: sc.TextGui;
                starCount?: sc.TextGui;
                lastUpdated?: sc.TextGui;
                authors?: sc.TextGui;
                tags?: sc.TextGui;
                modList: sc.ModMenuList;
                highlight: ModListEntryHighlight;
                modEntryActionButtonStart: {
                    height: number;
                    ninepatch: ig.NinePatch;
                    highlight: sc.ButtonGui.Highlight;
                };
                modEntryActionButtons: sc.ButtonGui.Type & {
                    ninepatch: ig.NinePatch;
                };
                iconGui: ig.ImageGui;
                tryDisableMod(this: this, mod: ModEntryLocal): string | undefined;
                tryEnableMod(this: this, mod: ModEntryLocal): string | undefined;
                getModName(this: this): {
                    icon: string;
                    text: string;
                };
                onButtonPress(this: this): void;
                setNameText(this: this, color: COLORS): void;
                updateHighlightWidth(this: this): void;
                onButtonPress(this: this): string | undefined;
            }
            interface ModListEntryConstructor extends ImpactClass<ModListEntry> {
                new (mod: ModEntry, modList: sc.ModMenuList): ModListEntry;
            }
            var ModListEntry: ModListEntryConstructor;
        }
    }
    enum COLORS {
        WHITE = 0,
        RED = 1,
        GREEN = 2,
        YELLOW = 3
    }
}
declare module "gui/repo-add" {
    import 'nax-ccuilib/src/headers/nax/input-field.d.ts';
    import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts';
    import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts';
    global {
        namespace sc {
            interface ModMenuRepoAddPopup extends ig.GuiElementBase {
                gfx: ig.Image;
                buttonInteract: ig.ButtonInteractEntry;
                buttonGroup: sc.ButtonGroup;
                urlFields: nax.ccuilib.InputField[];
                isOkTexts: sc.TextGui[];
                getTextUnknown(this: this): string;
                getTextOk(this: this): string;
                getTextBad(this: this): string;
                show(this: this): void;
                hide(this: this): void;
            }
            interface ModMenuRepoAddPopupConstructor extends ImpactClass<ModMenuRepoAddPopup> {
                new (): ModMenuRepoAddPopup;
            }
            var ModMenuRepoAddPopup: ModMenuRepoAddPopupConstructor;
        }
    }
}
declare module "gui/filters" {
    import { Fliters } from "filters";
    global {
        namespace sc {
            interface FiltersPopup extends ig.GuiElementBase {
                gfx: ig.Image;
                buttonGroup: sc.ButtonGroup;
                backButton: sc.ButtonGui;
                checkboxesGuis: {
                    text: sc.TextGui;
                    checkbox: sc.FilterCheckox;
                }[];
                infoBar: sc.InfoBar;
                getLangData(this: this, key: string): {
                    name: string;
                    description: string;
                };
                setFilterValue(this: this, config: CheckboxConfig, state: boolean): void;
                getFilterValue(this: this, config: CheckboxConfig): boolean | undefined;
                show(this: this): void;
                hide(this: this): void;
            }
            interface FiltersPopupConstructor extends ImpactClass<FiltersPopup> {
                new (): FiltersPopup;
            }
            var FiltersPopup: FiltersPopupConstructor;
            interface FilterCheckox extends sc.CheckboxGui {
            }
            interface FilterCheckoxConstructor extends ImpactClass<FilterCheckox> {
                new (): FilterCheckox;
            }
            var ModMenuFilterCheckboxGui: FilterCheckoxConstructor;
        }
    }
    export const isGridLocalStorageId = "CCModManager-grid";
    type CheckboxConfig = {
        key: string;
        default?: boolean;
    } & ({
        filterKey?: keyof Fliters;
    } | {
        localStorageKey: string;
        callback: () => void;
    });
}
declare module "gui/list" {
    import { ModEntry } from '../types';
    import { Fliters } from "filters";
    import "gui/list-entry";
    import "gui/repo-add";
    global {
        namespace sc {
            interface ModMenuList extends sc.ListTabbedPane, sc.Model.Observer {
                filters: Fliters;
                tabz: {
                    name: string;
                    icon: string;
                    populateFunc: (list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER) => void;
                }[];
                currentSort: sc.MOD_MENU_SORT_ORDER;
                reposPopup: sc.ModMenuRepoAddPopup;
                gridColumns: number;
                isGrid: boolean;
                updateColumnCount(this: this): void;
                reloadFilters(this: this): void;
                reloadEntries(this: this): void;
                sortModEntries(this: this, mods: ModEntry[], sort: sc.MOD_MENU_SORT_ORDER): void;
                populateOnline(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void;
                populateSelected(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void;
                populateEnabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void;
                populateDisabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void;
                populateSettings(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup): void;
                populateListFromMods(this: this, mods: ModEntry[], list: sc.ButtonListBox): void;
            }
            interface ModMenuListConstructor extends ImpactClass<ModMenuList> {
                new (): ModMenuList;
            }
            var ModMenuList: ModMenuListConstructor;
        }
    }
    export const modMenuListWidth = 552;
    export enum MOD_MENU_TAB_INDEXES {
        ONLINE = 0,
        SELECTED = 1,
        ENABLED = 2,
        DISABLED = 3,
        SETTINGS = 4
    }
}
declare module "gui/menu" {
    import 'nax-ccuilib/src/headers/nax/input-field.d.ts';
    import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts';
    import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts';
    import "gui/list";
    import "gui/filters";
    global {
        namespace sc {
            enum MOD_MENU_SORT_ORDER {
                NAME,
                STARS,
                LAST_UPDATED
            }
            enum MOD_MENU_MESSAGES {
                SELECTED_ENTRIES_CHANGED,
                TAB_CHANGED,
                REPOSITORY_CHANGED,
                UPDATE_ENTRIES,
                ENTRY_FOCUSED,
                ENTRY_UNFOCUSED,
                ENTRY_UPDATE_COLOR
            }
            interface ModMenu extends sc.ListInfoMenu, sc.Model {
                list: ModMenuList;
                inputField: nax.ccuilib.InputField;
                installButton: sc.ButtonGui;
                uninstallButton: sc.ButtonGui;
                checkUpdatesButton: sc.ButtonGui;
                filtersButton: sc.ButtonGui;
                filtersPopup: sc.FiltersPopup;
                setBlackBarVisibility(this: this, visible: boolean): void;
                setAllVisibility(this: this, visible: boolean): void;
                updateInstallButtonText(this: this): void;
                onBackButtonPress(this: this): void;
                setTabEvent(this: this): void;
                showModInstallDialog(this: this): void;
            }
            interface ModMenuConstructor extends ImpactClass<ModMenu> {
                new (): ModMenu;
            }
            var ModMenu: ModMenuConstructor;
            var modMenu: ModMenu;
        }
    }
}
declare module "gui/gui" {
    import "gui/menu";
}
declare module "plugin" {
    import { Mod1 } from './types';
    export default class ModManager {
        static dir: string;
        static mod: Mod1;
        constructor(mod: Mod1);
        prestart(): Promise<void>;
        poststart(): Promise<void>;
    }
}
declare module "local-mods" {
    import { ModEntryLocal } from './types';
    type CCL2Mod = {
        baseDirectory: string;
        dependencies?: Record<string, string>;
        disabled: boolean;
        name: string;
        displayName?: string;
        description?: string;
        version: string;
        icons?: {
            '24'?: string;
        };
        active?: boolean;
    };
    global {
        var activeMods: CCL2Mod[];
        var inactiveMods: CCL2Mod[];
        var versions: {
            ccloader: string;
            crosscode: string;
        };
    }
    export class LocalMods {
        private static cache;
        private static cacheRecord;
        static getAll(force?: boolean): ModEntryLocal[];
        static getAllRecord(): Record<string, ModEntryLocal>;
        static getActive(): ModEntryLocal[];
        static getInactive(): ModEntryLocal[];
        static setModActive(mod: ModEntryLocal, value: boolean): void;
        private static convertCCL2Mod;
        private static convertCCL3Mod;
        static getCCVersion(): string;
        static getCCLoaderVersion(): string;
        static findDeps(mod: ModEntryLocal): ModEntryLocal[];
    }
}
declare module "filters" {
    import { ModEntry } from './types';
    export interface Fliters {
        name?: string;
        hasIcon?: boolean;
        includeLocal?: boolean;
        hideLibraryMods?: boolean;
        tags?: string[];
    }
    export function createFuzzyFilteredModList<T extends ModEntry>(filters: Fliters, mods: T[]): T[];
}
