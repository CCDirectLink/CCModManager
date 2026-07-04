import './multipage-button-box';
export {};
declare global {
    namespace modmanager.gui {
        interface ManualEnforcer extends modmanager.gui.MultiPageButtonBoxGui {
            id: string;
            openendAt: number;
            waitSeconds: number;
        }
        interface ManualEnforcerConstructor extends ImpactClass<ManualEnforcer> {
            new (id: string, manualTitle: string, manualContent: sc.MultiPageBoxGui.ConditionalPage[], forceShowEvenIfRead?: boolean, enforceTime?: number): ManualEnforcer;
        }
        var ManualEnforcer: ManualEnforcerConstructor;
    }
}
