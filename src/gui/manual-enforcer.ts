import { Lang } from '../lang-manager'
import { Opts } from '../options'

import './multipage-button-box'

export {}
declare global {
    namespace modmanager.gui {
        interface ManualEnforcer extends modmanager.gui.MultiPageButtonBoxGui {
            id: string
            openendAt: number
            waitSeconds: number
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
    init(id, manualTitle, manualContent, forceShowEvenIfRead, enforceTimeSeconds = 0.5) {
        if (Opts.manualEnforcerRead[id] && !forceShowEvenIfRead) return

        this.openendAt = Date.now()
        this.waitSeconds = enforceTimeSeconds
        this.id = id

        this.parent(undefined, undefined, [
            {
                name: Lang.close,
                onPress: _pageIndex => {
                    this.closeMenu()
                },
            },
        ])
        this.setContent(manualTitle, manualContent)
        this.blockClosing = true

        this.openMenu()
    },
    closeMenu() {
        this.parent()

        Opts.manualEnforcerRead = {
            ...Opts.manualEnforcerRead,
            [this.id]: true,
        }
    },
    update() {
        this.parent()
        const button = this.userButtons![0]
        if (Date.now() > this.openendAt + this.waitSeconds * 1000) {
            button.setActive(true)
            this.blockClosing = false
        } else {
            button.setActive(false)
        }
    },
})
