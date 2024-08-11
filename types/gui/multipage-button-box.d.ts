export {};
declare global {
    namespace modmanager.gui {
        interface MultiPageButtonBoxGui extends sc.MultiPageBoxGui {
            userButtonGroup?: sc.ButtonGroup;
            userButtons?: sc.ButtonGui[];
            buttonConfigs?: {
                name: string;
                onPress: (pageIndex: number) => void;
            }[];
            blockClosing?: boolean;
            setContent(this: this, defaultHeaderText: string, pages: sc.MultiPageBoxGui.ConditionalPage[], partitionPages?: boolean): void;
            partitionContent(this: this, content: string[]): string[];
            setPageHeader(this: this, pageIndex: number, header: string): void;
            setPageText(this: this, pageIndex: number, content: string[], partitionPages?: boolean): void;
            refreshPage(this: this): void;
        }
        interface MultiPageButtonBoxGuiConstructor extends ImpactClass<MultiPageButtonBoxGui> {
            new (width?: number, height?: number, buttons?: modmanager.gui.MultiPageButtonBoxGui['buttonConfigs']): MultiPageButtonBoxGui;
        }
        var MultiPageButtonBoxGui: MultiPageButtonBoxGuiConstructor;
    }
}
