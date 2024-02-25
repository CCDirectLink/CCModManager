import { FileCache } from '../cache'
import { InstallQueue, ModInstaller } from '../mod-installer'
import { ModEntry, ModEntryLocal } from '../types'

function getNod() {
    return ig.LangLabel.getText({
        en_US: '[nods]',
        de_DE: '[nickt]',
        zh_CN: '[\u70b9\u5934]<<A<<[CHANGED 2017/10/10]',
        ko_KR: '[\ub044\ub355]<<A<<[CHANGED 2017/10/17]',
        ja_JP: '[\u3046\u306a\u305a\u304f]<<A<<[CHANGED 2017/11/04]',
        zh_TW: '[\u9ede\u982d]<<A<<[CHANGED 2017/10/10]',
    })
}

export class ModInstallDialogs {
    static showModInstallDialog() {
        const deps = InstallQueue.values().filter(mod => mod.installStatus == 'dependency')
        const toInstall = InstallQueue.values().filter(mod => mod.installStatus == 'new')
        const toUpdate = InstallQueue.values().filter(mod => mod.installStatus == 'update')
        if (deps.length == 0 && toInstall.length == 0 && toUpdate.length == 0) return

        function modsToStr(mods: ModEntry[]) {
            return mods.map(mod => `- \\c[3]${mod.name.replace(/\\c\[\d]/g, '')}\\c[0]\n`).join('')
        }
        const header = ig.lang.get('sc.gui.menu.ccmodmanager.areYouSureYouWantTo') + '\n'
        const toInstallStr = toInstall.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodmanager.toInstall')}\n${modsToStr(toInstall)}` : ''
        const toUpdateStr = toUpdate.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodmanager.toUpdate')}\n${modsToStr(toUpdate)}` : ''
        const depsStr = deps.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodmanager.dependencies')}\n${modsToStr(deps)}` : ''

        const str = `${header}${toInstallStr}${toUpdateStr}${depsStr}`
        sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [getNod(), ig.lang.get('sc.gui.dialogs.no')], button => {
            if (button.text!.toString() == getNod()) {
                const toInstall = InstallQueue.values()
                ModInstaller.install(toInstall)
                    .then(() => {
                        InstallQueue.clear()
                        sc.modMenu && sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)
                        sc.BUTTON_SOUND.shop_cash.play()
                        sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.menu.ccmodmanager.askRestartInstall'), sc.DIALOG_INFO_ICON.QUESTION, button => {
                            const text = button.text!.toString()
                            if (text == ig.lang.get('sc.gui.dialogs.yes')) {
                                ModInstaller.restartGame()
                            } else {
                                toInstall.forEach(mod => {
                                    mod.awaitingRestart = true
                                })
                            }
                        })
                    })
                    .catch(err => {
                        FileCache.isThereInternet(true).then(isThereInternet => {
                            if (!isThereInternet) err = ig.lang.get('sc.gui.menu.ccmodmanager.noInternet')
                            sc.Dialogs.showErrorDialog(err)
                        })
                    })
            }
        })
    }

    static showAutoUpdateDialog() {
        const deps = InstallQueue.values().filter(mod => mod.installStatus == 'dependency')
        const toInstall = InstallQueue.values().filter(mod => mod.installStatus == 'new')
        const toUpdate = InstallQueue.values().filter(mod => mod.installStatus == 'update')
        if (deps.length == 0 && toInstall.length == 0 && toUpdate.length == 0) return

        const yes = ig.lang.get('sc.gui.dialogs.yes')
        const no = ig.lang.get('sc.gui.dialogs.no')
        sc.Dialogs.showChoiceDialog(ig.lang.get('sc.gui.menu.ccmodmanager.updatesDetected'), sc.DIALOG_INFO_ICON.QUESTION, [yes, no], button => {
            const text = button.text!.toString()
            if (text == yes) {
                this.showModInstallDialog()
            } else {
                InstallQueue.clear()
            }
        })
    }

    static showModUninstallDialog(localMod: ModEntryLocal) {
        const deps = ModInstaller.getWhatDependsOnAMod(localMod)
        if (deps.length == 0) {
            const str = ig.lang.get('sc.gui.menu.ccmodmanager.areYouSureYouWantToUninstall').replace(/\[modName\]/, localMod.name.replace(/\\c\[\d]/g, ''))
            sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [getNod(), ig.lang.get('sc.gui.dialogs.no')], button => {
                if (button.text!.toString() == getNod()) {
                    ModInstaller.uninstallMod(localMod).then(() => {
                        localMod.awaitingRestart = true
                        localMod.active = false
                        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)
                        sc.BUTTON_SOUND.shop_cash.play()
                        sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.menu.ccmodmanager.askRestartUninstall'), sc.DIALOG_INFO_ICON.QUESTION, button => {
                            const text = button.text!.toString()
                            if (text == ig.lang.get('sc.gui.dialogs.yes')) {
                                ModInstaller.restartGame()
                            }
                        })
                    })
                }
            })
        } else {
            sc.Dialogs.showErrorDialog(
                ig.lang.get('sc.gui.menu.ccmodmanager.cannotUninstall').replace(/\[modName\]/, localMod.name) +
                    deps.map(mod => `- \\c[3]${mod.name.replace(/\\c\[\d]/g, '')}\\c[0]\n`).join('')
            )
        }
    }
}
