declare global {
    namespace modmanager.gui {
        interface RepoAddPopup extends ig.GuiElementBase {
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
        interface RepoAddPopupConstructor extends ImpactClass<RepoAddPopup> {
            new (): RepoAddPopup;
        }
        var RepoAddPopup: RepoAddPopupConstructor;
    }
}
export {};
