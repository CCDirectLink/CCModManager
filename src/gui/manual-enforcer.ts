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
                name: `Yes, I've read the manual`,
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
                            failuteToReadCount == 0 ? "No you didn't"
                          : failuteToReadCount == 1 ? 'Please, just read it'
                          : failuteToReadCount == 2 ? "You successfully didn't read the manual 3 times. Are you proud of yourself?"
                          : failuteToReadCount == 3 ? '...'
                          : "That's it. You crossed the line."
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
