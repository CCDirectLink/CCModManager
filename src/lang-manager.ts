import en_US from '../lang/en_US.json'
// import * as de_DE from '../lang/de_DE.json'

type LangType = typeof en_US
export let Lang: LangType

const langs: Record<string, LangType> = {
    en_US: en_US,
    // de_DE: de_DE,
}

export class LangManager {
    constructor() {
        /* in prestart */
        Lang = langs[localStorage.getItem('IG_LANG')!] ?? en_US
    }

    async poststart() {
        console.log(ig.lang)
        ig.lang.labels.sc.gui.menu['menu-titles'].mods = Lang.mods
        ig.merge(ig.lang.labels.sc.gui.menu.sort, Lang.sort)
        ig.lang.labels.sc.gui.menu['help-texts'].mods = Lang.help
    }
}
