declare global {
    namespace modmanager.gui {
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
export {};
