import { Lang } from '../lang-manager'
import { Opts } from '../options'

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

        let failuteToReadCount = 0
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
                        // prettier-ignore
                        const text =
                            failuteToReadCount == 0 ? Lang.help.enforcment.fail0
                          : failuteToReadCount == 1 ? Lang.help.enforcment.fail1
                          : failuteToReadCount == 2 ? Lang.help.enforcment.fail2
                          : failuteToReadCount == 3 ? Lang.help.enforcment.fail3
                          : Lang.help.enforcment.fail4
                        sc.Dialogs.showErrorDialog(text, false, () => {
                            if (failuteToReadCount == 4) throw new Error('MANUAL_NOT_READ')
                            button.setActive(false)
                            this.openendAt = Date.now()
                            failuteToReadCount++

                            setTimeout(() => button.setActive(true), (enforceTimeSeconds / 2) * 1000)
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
