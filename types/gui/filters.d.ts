import { Fliters } from '../filters';
import { Lang } from '../lang-manager';
declare global {
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
            getLangData(this: this, key: keyof typeof Lang.filters): {
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
export declare const isGridLocalStorageId = "CCModManager-grid";
type CheckboxConfig = {
    key: keyof typeof Lang.filters;
    default?: boolean;
} & ({
    filterKey?: keyof Fliters;
} | {
    localStorageKey: string;
    callback: () => void;
});
export {};
