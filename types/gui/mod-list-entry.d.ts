import type { ModEntry, ModEntryLocal } from '../types';
import './list-entry';
declare global {
    namespace modmanager.gui {
        interface ModListEntry extends modmanager.gui.ListEntry {
            mod: ModEntry;
            tryDisableMod(this: this, mod: ModEntryLocal): string | undefined;
            tryEnableMod(this: this, mod: ModEntryLocal): string | undefined;
            toggleSelection(this: this, force?: boolean): string | undefined;
        }
        interface ModListEntryConstructor extends ImpactClass<ModListEntry> {
            new (mod: ModEntry, modList: modmanager.gui.MenuList): ModListEntry;
        }
        var ModListEntry: ModListEntryConstructor;
    }
}
