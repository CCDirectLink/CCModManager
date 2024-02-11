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
        const deps = InstallQueue.deps
        const toInstall = InstallQueue.values()
        const toUpdate = InstallQueue.depsToUpdate
        if (deps.length == 0 && toInstall.length == 0 && toUpdate.length == 0) return

        function modsToStr(mods: ModEntry[]) {
            return mods.map(mod => `- \\c[3]${mod.name.replace(/\\c\[\d]/g, '')}\\c[0]\n`).join('')
        }
        const header = ig.lang.get('sc.gui.menu.ccmodloader.areYouSureYouWantTo') + '\n'
        const toInstallStr = toInstall.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodloader.toInstall')}\n${modsToStr(toInstall)}` : ''
        const toUpdateStr = toUpdate.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodloader.toUpdate')}\n${modsToStr(toUpdate)}` : ''
        const depsStr = deps.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodloader.dependencies')}\n${modsToStr(deps)}` : ''

        const str = `${header}${toInstallStr}${toUpdateStr}${depsStr}`
        sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [getNod(), ig.lang.get('sc.gui.dialogs.no')], button => {
            if (button.text!.toString() == getNod()) {
                const toInstall = InstallQueue.deps.concat(InstallQueue.values())
                ModInstaller.install(toInstall, InstallQueue.depsToUpdate)
                    .then(() => {
                        InstallQueue.deps = []
                        InstallQueue.clear()
                        sc.modMenu && sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)
                        sc.BUTTON_SOUND.shop_cash.play()
                        sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.menu.ccmodloader.askRestartInstall'), sc.DIALOG_INFO_ICON.QUESTION, button => {
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
                            if (!isThereInternet) err = 'Error: No internet connection'
                            sc.Dialogs.showErrorDialog(err)
                        })
                    })
            }
        })
    }

    static showAutoUpdateDialog(showUpToDateDialog: boolean) {
        const deps = InstallQueue.deps
        const toInstall = InstallQueue.values()
        const toUpdate = InstallQueue.depsToUpdate
        if (deps.length == 0 && toInstall.length == 0 && toUpdate.length == 0) {
            if (showUpToDateDialog) sc.Dialogs.showInfoDialog(ig.lang.get('sc.gui.menu.ccmodloader.upToDate'))
            return
        }

        const yes = ig.lang.get('sc.gui.dialogs.yes')
        const no = ig.lang.get('sc.gui.dialogs.no')
        sc.Dialogs.showChoiceDialog(ig.lang.get('sc.gui.menu.ccmodloader.updatesDetected'), sc.DIALOG_INFO_ICON.QUESTION, [yes, no], button => {
            const text = button.text!.toString()
            if (text == yes) {
                this.showModInstallDialog()
            }
        })
    }

    static showModUninstallDialog(localMod: ModEntryLocal) {
        const deps = ModInstaller.getWhatDependsOnAMod(localMod)
        if (deps.length == 0) {
            const str = ig.lang.get('sc.gui.menu.ccmodloader.areYouSureYouWantToUninstall').replace(/\[modName\]/, localMod.name.replace(/\\c\[\d]/g, ''))
            sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [getNod(), ig.lang.get('sc.gui.dialogs.no')], button => {
                if (button.text!.toString() == getNod()) {
                    ModInstaller.uninstallMod(localMod).then(() => {
                        localMod.awaitingRestart = true
                        localMod.active = false
                        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)
                        sc.BUTTON_SOUND.shop_cash.play()
                        sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.menu.ccmodloader.askRestartUninstall'), sc.DIALOG_INFO_ICON.QUESTION, button => {
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
                ig.lang.get('sc.gui.menu.ccmodloader.cannotUninstall').replace(/\[modName\]/, localMod.name) +
                    deps.map(mod => `- \\c[3]${mod.name.replace(/\\c\[\d]/g, '')}\\c[0]\n`).join('')
            )
        }
    }
}
