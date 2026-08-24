export function prepareModName(mod: { name: string }) {
    return mod.name
        .replace(/\\c\[\d]/g, '')
        .replace(/\\i\[[a-zA-Z0-9-_]*\]/g, '')
        .trim()
}

export function isFullMode() {
    return !ig.isdemo && ig.platform == ig.PLATFORM_TYPES.DESKTOP
}

export function openLink(url: string) {
    if (ig.platform == ig.PLATFORM_TYPES.DESKTOP) {
        nw.Shell.openExternal(url)
    } else {
        window.open(url, '_blank')?.focus()
    }
}

export function popMenu() {
    if (sc.version.major == 1 && sc.version.minor == 4) {
        sc.menu.popMenu()
    } else {
        /* crosscode v1.0.2 fix */
        /* older version of crosscode handle directMode and directMenu differently */
        if (!(sc.menu.menuStack.length <= 0)) {
            sc.menu.previousMenu = sc.menu.menuStack.pop()!
            sc.menu.currentMenu =
                sc.menu.menuStack.length > 0
                    ? sc.menu.menuStack[sc.menu.menuStack.length - 1]
                    : sc.menu.directMode
                      ? sc.menu.directMenu
                      : sc.MENU_SUBMENU.START
            sc.menu.setInfoText('', true)
            sc.menu.hotkeysCallbacks = []
            sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.LEAVE_MENU)
        }
    }
}
