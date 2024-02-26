import 'nax-ccuilib/src/headers/nax/input-field.d.ts';
import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts';
import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts';
declare global {
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
