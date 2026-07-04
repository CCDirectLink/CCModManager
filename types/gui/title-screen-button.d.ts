export {};
declare global {
    namespace sc {
        interface TitleScreenButtonGui {
            modsButton: sc.ButtonGui;
            showModsButton(this: this): void;
        }
    }
}
