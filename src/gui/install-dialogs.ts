import { FileCache } from '../cache'
import { LocalMods } from '../local-mods'
import { InstallQueue, ModInstaller } from '../mod-installer'
import { ModEntry, ModEntryLocal } from '../types'

export function prepareModName(name: string) {
    return name.replace(/\\c\[\d]/g, '')
}

export class ModInstallDialogs {
    static showModInstallDialog() {
        const deps = InstallQueue.values().filter(mod => mod.installStatus == 'dependency')
        const toInstall = InstallQueue.values().filter(mod => mod.installStatus == 'new')
        const toUpdate = InstallQueue.values().filter(mod => mod.installStatus == 'update')
        if (deps.length == 0 && toInstall.length == 0 && toUpdate.length == 0) return

        function modsToStr(mods: ModEntry[]) {
            return mods.map(mod => `- \\c[3]${prepareModName(mod.name)}\\c[0]\n`).join('')
        }
        const header = ig.lang.get('sc.gui.menu.ccmodmanager.areYouSureYouWantTo') + '\n'
        const toInstallStr = toInstall.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodmanager.toInstall')}\n${modsToStr(toInstall)}` : ''
        const toUpdateStr = toUpdate.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodmanager.toUpdate')}\n${modsToStr(toUpdate)}` : ''
        const depsStr = deps.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodmanager.dependencies')}\n${modsToStr(deps)}` : ''

        const str = `${header}${toInstallStr}${toUpdateStr}${depsStr}`
        sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [ig.lang.get('sc.gui.dialogs.yes'), ig.lang.get('sc.gui.dialogs.no')], button => {
            if (button.data != 0) return
            const toInstall = InstallQueue.values()
            ModInstaller.install(toInstall)
                .then(() => {
                    InstallQueue.clear()
                    sc.modMenu && sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)
                    sc.BUTTON_SOUND.shop_cash.play()
                    sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.menu.ccmodmanager.askRestartInstall'), sc.DIALOG_INFO_ICON.QUESTION, button => {
                        if (button.data == 0) {
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
        })
    }

    static showAutoUpdateDialog() {
        const deps = InstallQueue.values().filter(mod => mod.installStatus == 'dependency')
        const toInstall = InstallQueue.values().filter(mod => mod.installStatus == 'new')
        const toUpdate = InstallQueue.values().filter(mod => mod.installStatus == 'update')
        if (deps.length == 0 && toInstall.length == 0 && toUpdate.length == 0) return

        sc.Dialogs.showChoiceDialog(
            ig.lang.get('sc.gui.menu.ccmodmanager.updatesDetected'),
            sc.DIALOG_INFO_ICON.QUESTION,
            [ig.lang.get('sc.gui.dialogs.yes'), ig.lang.get('sc.gui.dialogs.no')],
            button => {
                if (button.data == 0) {
                    this.showModInstallDialog()
                } else {
                    InstallQueue.clear()
                }
            }
        )
    }

    static showModUninstallDialog(localMod: ModEntryLocal) {
        const deps = ModInstaller.getWhatDependsOnAMod(localMod)
        if (deps.length == 0) {
            const str = ig.lang.get('sc.gui.menu.ccmodmanager.areYouSureYouWantToUninstall').replace(/\[modName\]/, prepareModName(localMod.name))
            sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [ig.lang.get('sc.gui.dialogs.yes'), ig.lang.get('sc.gui.dialogs.no')], button => {
                if (button.data == 0) {
                    ModInstaller.uninstallMod(localMod).then(() => {
                        localMod.awaitingRestart = true
                        localMod.active = false
                        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)
                        sc.BUTTON_SOUND.shop_cash.play()
                        sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.menu.ccmodmanager.askRestartUninstall'), sc.DIALOG_INFO_ICON.QUESTION, button => {
                            if (button.data == 0) {
                                ModInstaller.restartGame()
                            }
                        })
                    })
                }
            })
        } else {
            sc.Dialogs.showErrorDialog(
                ig.lang.get('sc.gui.menu.ccmodmanager.cannotUninstall').replace(/\[modName\]/, prepareModName(localMod.name)) +
                    deps.map(mod => `- \\c[3]${prepareModName(mod.name)}\\c[0]\n`).join('')
            )
        }
    }

    static checkCanDisableMod(mod: ModEntryLocal): boolean {
        const deps = ModInstaller.getWhatDependsOnAMod(mod, true)
        if (deps.length == 0) return true
        sc.Dialogs.showErrorDialog(
            ig.lang.get('sc.gui.menu.ccmodmanager.cannotDisable').replace(/\[modName\]/, prepareModName(mod.name)) +
                deps.map(mod => `- \\c[3]${prepareModName(mod.name)}\\c[0]\n`).join('')
        )
        return false
    }

    static async checkCanEnableMod(mod: ModEntryLocal): Promise<ModEntryLocal[] | undefined> {
        const deps = LocalMods.findDeps(mod).filter(mod => !mod.active)
        if (deps.length == 0) return []

        return new Promise(resolve => {
            sc.Dialogs.showYesNoDialog(
                ig.lang
                    .get('sc.gui.menu.ccmodmanager.doYouWantToEnable')
                    .replace(/\[modName\]/, prepareModName(mod.name))
                    .replace(/\[mods\]/, deps.map(mod => `- \\c[3]${prepareModName(mod.name)}\\c[0]\n`).join('')),
                sc.DIALOG_INFO_ICON.QUESTION,
                button => {
                    if (button.data == 0) {
                        resolve(deps)
                    } else {
                        resolve(undefined)
                    }
                }
            )
        })
    }
}
