import { Lang } from '../lang-manager';
declare global {
    namespace modmanager.gui {
        interface FiltersPopup extends ig.GuiElementBase {
            gfx: ig.Image;
            buttonInteract: ig.ButtonInteractEntry;
            buttonGroup: sc.ButtonGroup;
            backButton: sc.ButtonGui;
            checkboxesGuis: {
                text: sc.TextGui;
                checkbox: modmanager.gui.FilterCheckox;
            }[];
            infoBar: sc.InfoBar;
            onHide: () => void;
            getLangData(this: this, key: keyof typeof Lang.filters): {
                name: string;
                description: string;
            };
            setFilterValue(this: this, config: CheckboxConfig, state: boolean, noReload?: boolean): void;
            getFilterValue(this: this, config: CheckboxConfig): boolean | undefined;
            show(this: this): void;
            hide(this: this): void;
        }
        interface FiltersPopupConstructor extends ImpactClass<FiltersPopup> {
            new (onHide: FiltersPopup['onHide']): FiltersPopup;
        }
        var FiltersPopup: FiltersPopupConstructor;
        interface FilterCheckox extends sc.CheckboxGui {
        }
        interface FilterCheckoxConstructor extends ImpactClass<FilterCheckox> {
            new (): FilterCheckox;
        }
        var FilterCheckboxGui: FilterCheckoxConstructor;
    }
}
type CheckboxConfig = {
    key: keyof typeof Lang.filters;
    default?: boolean;
} & ({} | {
    optsKey: 'isGrid' | 'hideLibraryMods' | 'includeLocalModsInOnline';
});
export {};
