import { Lang } from '../lang-manager'
import { ModEntryServer } from '../types'
import { generateChangelogPage } from './changelog-page-generator'

import './multipage-button-box'

declare global {
    namespace modmanager.gui {
        interface Changelog extends modmanager.gui.MultiPageButtonBoxGui {
            mod: ModEntryServer

            setMod(this: this, mod: ModEntryServer): void
        }
        interface ChangelogConstructor extends ImpactClass<Changelog> {
            new (): Changelog
        }
        var Changelog: ChangelogConstructor
    }
}

modmanager.gui.Changelog = modmanager.gui.MultiPageButtonBoxGui.extend({
    init() {
        const self = this
        this.parent(undefined, undefined, [
            {
                name: Lang.visitReleasePage,
                onPress(pageIndex) {
                    const url = self.mod.releasePages![pageIndex].url
                    nw.Shell.openExternal(url)
                },
            },
        ])
    },
    setMod(mod) {
        if (!mod.releasePages) throw new Error('das')

        this.mod = mod

        const pages = mod.releasePages.map(page => generateChangelogPage(page))

        this.setContent(mod.name, pages)
    },
})
