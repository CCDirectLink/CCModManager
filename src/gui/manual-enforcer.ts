import { Lang } from '../lang-manager'
import { Opts } from '../options'

import './multipage-button-box'

export {}
declare global {
    namespace modmanager.gui {
        interface ManualEnforcer extends modmanager.gui.MultiPageButtonBoxGui {
            openendAt: number
        }
        interface ManualEnforcerConstructor extends ImpactClass<ManualEnforcer> {
            new (
                id: string,
                manualTitle: string,
                manualContent: sc.MultiPageBoxGui.ConditionalPage[],
                forceShowEvenIfRead?: boolean,
                enforceTime?: number
            ): ManualEnforcer
        }
        var ManualEnforcer: ManualEnforcerConstructor
    }
}

modmanager.gui.ManualEnforcer = modmanager.gui.MultiPageButtonBoxGui.extend({
    init(id, manualTitle, manualContent, forceShowEvenIfRead, enforceTimeSeconds = 5) {
        if (Opts.manualEnforcerRead[id] && !forceShowEvenIfRead) return

        this.parent(undefined, undefined, [
            {
                name: Lang.help.enforcment.button,
                onPress: _pageIndex => {
                    if (this.openendAt + enforceTimeSeconds * 1000 < Date.now()) {
                        this.blockClosing = false
                        this.closeMenu()
                        Opts.manualEnforcerRead = {
                            ...Opts.manualEnforcerRead,
                            [id]: true,
                        }
                    } else {
                        const button = this.userButtons![0]
                        const text = Lang.help.enforcment.fail
                        sc.Dialogs.showErrorDialog(text, false, () => {
                            button.setActive(false)
                            this.openendAt = Date.now()

                            setTimeout(() => button.setActive(true), enforceTimeSeconds * 1000)
                        })
                    }
                },
            },
        ])
        this.setContent(manualTitle, manualContent)
        this.blockClosing = true

        this.openMenu()
        this.openendAt = Date.now()
    },
})
