import { ModEntryServer } from '../types';
import './multipage-button-box';
declare global {
    namespace modmanager.gui {
        interface Changelog extends modmanager.gui.MultiPageButtonBoxGui {
            mod: ModEntryServer;
            setMod(this: this, mod: ModEntryServer): void;
        }
        interface ChangelogConstructor extends ImpactClass<Changelog> {
            new (): Changelog;
        }
        var Changelog: ChangelogConstructor;
    }
}
