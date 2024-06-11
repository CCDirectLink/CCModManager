export {}
declare global {
    namespace modmanager.gui.ModSettingsTabBox {
        interface TabButton extends sc.ItemTabbedBox.TabButton {
            data: {
                type: string
            }
        }
        interface TabButtonConstructor extends ImpactClass<TabButton> {
            new (
                text?: Nullable<sc.TextLike>,
                icon?: Nullable<string>,
                largeWidth?: Nullable<number>,
                smallWidth?: Nullable<number>,
                noIcon?: Nullable<boolean>
            ): TabButton
        }
    }
}
modmanager.gui.ModSettingsTabBox.TabButton = sc.ItemTabbedBox.TabButton.extend({})
