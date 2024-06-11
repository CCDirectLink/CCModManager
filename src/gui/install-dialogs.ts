import { FileCache } from '../cache'
import { Lang } from '../lang-manager'
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
            return mods
                .map(mod => {
                    const localVersion = LocalMods.getAllRecord()[mod.id]?.version
                    return `- \\c[3]${prepareModName(mod.name)}\\c[0] ${localVersion ? `${localVersion} -> ` : ''}v${mod.version}\n`
                })
                .join('')
        }
        const header = Lang.areYouSureYouWantTo + '\n'
        const toInstallStr = toInstall.length > 0 ? `${Lang.toInstall}\n${modsToStr(toInstall)}` : ''
        const toUpdateStr = toUpdate.length > 0 ? `${Lang.toUpdate}\n${modsToStr(toUpdate)}` : ''
        const depsStr = deps.length > 0 ? `${Lang.dependencies}\n${modsToStr(deps)}` : ''

        const str = `${header}${toInstallStr}${toUpdateStr}${depsStr}`
        sc.Dialogs.showChoiceDialog(
            str,
            sc.DIALOG_INFO_ICON.QUESTION,
            [ig.lang.get('sc.gui.dialogs.yes'), ig.lang.get('sc.gui.dialogs.no')],
            button => {
                if (button.data != 0) return
                const toInstall = InstallQueue.values()
                ModInstaller.install(toInstall)
                    .then(() => {
                        InstallQueue.clear()
                        modmanager.gui.modMenuGui &&
                            sc.Model.notifyObserver(
                                modmanager.gui.modMenuGui,
                                modmanager.gui.MOD_MENU_MESSAGES.UPDATE_ENTRIES
                            )
                        sc.BUTTON_SOUND.shop_cash.play()
                        sc.Dialogs.showYesNoDialog(Lang.askRestartInstall, sc.DIALOG_INFO_ICON.QUESTION, button => {
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
                            if (!isThereInternet) err = Lang.noInternet
                            sc.Dialogs.showErrorDialog(err)
                        })
                    })
            }
        )
    }

    static showAutoUpdateDialog() {
        const deps = InstallQueue.values().filter(mod => mod.installStatus == 'dependency')
        const toInstall = InstallQueue.values().filter(mod => mod.installStatus == 'new')
        const toUpdate = InstallQueue.values().filter(mod => mod.installStatus == 'update')
        if (deps.length == 0 && toInstall.length == 0 && toUpdate.length == 0) return

        sc.Dialogs.showChoiceDialog(
            Lang.updatesDetected,
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

    static showModUninstallDialog(localMod: ModEntryLocal): boolean {
        if (localMod.disableUninstall) {
            sc.Dialogs.showErrorDialog(
                Lang.cannotUninstallDisabled.replace(/\[modName\]/, prepareModName(localMod.name))
            )
            return false
        }
        if (localMod.isGit) {
            sc.Dialogs.showErrorDialog(Lang.cannotUninstallGit.replace(/\[modName\]/, prepareModName(localMod.name)))
            return false
        }
        const deps = ModInstaller.getWhatDependsOnAMod(localMod)
        if (deps.length > 0) {
            sc.Dialogs.showErrorDialog(
                Lang.cannotUninstall.replace(/\[modName\]/, prepareModName(localMod.name)) +
                    deps.map(mod => `- \\c[3]${prepareModName(mod.name)}\\c[0]\n`).join('')
            )
            return false
        }
        const str = Lang.areYouSureYouWantToUninstall.replace(/\[modName\]/, prepareModName(localMod.name))
        sc.Dialogs.showChoiceDialog(
            str,
            sc.DIALOG_INFO_ICON.QUESTION,
            [ig.lang.get('sc.gui.dialogs.no'), ig.lang.get('sc.gui.dialogs.yes')],
            button => {
                if (button.data == 1) {
                    ModInstaller.uninstallMod(localMod)
                        .then(() => {
                            localMod.awaitingRestart = true
                            localMod.active = false
                            sc.Model.notifyObserver(
                                modmanager.gui.modMenuGui,
                                modmanager.gui.MOD_MENU_MESSAGES.UPDATE_ENTRIES
                            )
                            sc.BUTTON_SOUND.shop_cash.play()
                            sc.Dialogs.showYesNoDialog(
                                Lang.askRestartUninstall,
                                sc.DIALOG_INFO_ICON.QUESTION,
                                button => {
                                    if (button.data == 0) {
                                        ModInstaller.restartGame()
                                    }
                                }
                            )
                        })
                        .catch(err => {
                            sc.Dialogs.showErrorDialog(err)
                        })
                }
            }
        )
        return true
    }

    static checkCanDisableMod(mod: ModEntryLocal): boolean {
        if (mod.disableDisabling) {
            sc.Dialogs.showErrorDialog(Lang.cannotDisableDisabled.replace(/\[modName\]/, prepareModName(mod.name)))
            return false
        }
        const deps = ModInstaller.getWhatDependsOnAMod(mod, true)
        if (deps.length == 0) return true
        sc.Dialogs.showErrorDialog(
            Lang.cannotDisable.replace(/\[modName\]/, prepareModName(mod.name)) +
                deps.map(mod => `- \\c[3]${prepareModName(mod.name)}\\c[0]\n`).join('')
        )
        return false
    }

    static async checkCanEnableMod(mod: ModEntryLocal): Promise<ModEntryLocal[] | undefined> {
        const deps = LocalMods.findDeps(mod).filter(mod => !mod.active)
        if (deps.length == 0) return []

        return new Promise(resolve => {
            sc.Dialogs.showYesNoDialog(
                Lang.doYouWantToEnable
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
