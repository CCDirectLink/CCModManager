import { FileCache } from '../cache'
import { Lang } from '../lang-manager'
import { LocalMods } from '../local-mods'
import { InstallQueue, ModInstaller, ModInstallerDownloadingProgress } from '../mod-installer'
import { ModEntry, ModEntryLocal, ModEntryServer } from '../types'

export function prepareModName(name: string) {
    return name.replace(/\\c\[\d]/g, '')
}

const white = '\\c[0]'
const green = '\\c[2]'
const yellow = '\\c[3]'

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
                    return `- ${yellow}${prepareModName(mod.name)}${white} ${localVersion ? `${localVersion} -> ` : ''}${mod.version}\n`
                })
                .join('')
        }
        const toInstallStr = toInstall.length > 0 ? `${Lang.toInstall}\n${modsToStr(toInstall)}` : ''
        const toUpdateStr = toUpdate.length > 0 ? `${Lang.toUpdate}\n${modsToStr(toUpdate)}` : ''
        const depsStr = deps.length > 0 ? `${Lang.dependencies}\n${modsToStr(deps)}` : ''

        const str = `${toInstallStr}${toUpdateStr}${depsStr}`
        const modCount = toInstall.length + toUpdate.length + deps.length

        const dialog = new modmanager.gui.MultiPageButtonBoxGui(undefined, undefined, [
            {
                name: Lang.install,
                onPress: installModsFunc,
            },
            {
                name: ig.lang.get('sc.gui.shop.cancel'),
                onPress() {
                    dialog.closeMenu()
                },
            },
        ])
        dialog.setContent(Lang.installButton.replace(/\[modCount\]/, modCount.toString()), [
            {
                content: [str],
            },
        ])

        const STATUS = {
            preparing: 0,
            downloading: 1,
            installing: 2,
            done: 3,
        } as const
        const log: {
            mod: ModEntryServer
            progressFunc?: () => ModInstallerDownloadingProgress
            status: (typeof STATUS)[keyof typeof STATUS]
        }[] = []

        const KiB = 1024
        const MiB = KiB * 1024

        function displayLog() {
            const str = log
                .sort((a, b) => a.status - b.status)
                .map(({ mod, status, progressFunc }) => {
                    let statusStr: string
                    if (status == STATUS.preparing) {
                        statusStr = 'Preparing...'
                    } else if (status == STATUS.downloading) {
                        const progress = progressFunc!()
                        const [scale, unit] = progress.length >= MiB ? [MiB, 'MiB'] : [KiB, 'KiB']
                        statusStr = `Downloading... ${yellow}${(progress.received / scale).round(0)}${white}/${yellow}${(progress.length / scale).round(0)}${white} ${unit}`
                    } else if (status == STATUS.installing) {
                        statusStr = 'Installing...'
                    } else {
                        statusStr = `${green}Done${white}`
                    }

                    return `${yellow}${mod.id}${white} ${mod.version} - ${statusStr}`
                })
                .join('\n')

            dialog.setPageText(0, [str])
            dialog.refreshPage()
        }

        function installModsFunc(): void {
            const [installButton, cancelButton] = dialog.userButtons!
            installButton.setActive(false)
            cancelButton.setActive(false)

            dialog.setPageHeader(0, Lang.installingModsHeader.replace(/\[modCount\]/, modCount.toString()))
            dialog.blockClosing = true

            const eventIndex = ModInstaller.eventListeners.push({
                preparing(mod) {
                    log.push({ mod, status: STATUS.preparing })
                    displayLog()
                },
                downloading(mod, progressFunc) {
                    const entry = log.find(e => e.mod == mod)!
                    entry.status = STATUS.downloading
                    entry.progressFunc = progressFunc
                    displayLog()
                },
                installing(mod) {
                    const entry = log.find(e => e.mod == mod)!
                    entry.status = STATUS.installing
                    displayLog()
                },
                done(mod) {
                    const entry = log.find(e => e.mod == mod)!
                    entry.status = STATUS.done
                    displayLog()
                },
            })
            const dialogUpdate = dialog.update.bind(dialog)
            let frame = 0
            dialog.update = function (this: typeof dialog) {
                if (frame++ % 3 == 0) displayLog()
                dialogUpdate()
            }

            const toInstall = InstallQueue.values()
            ModInstaller.install(toInstall)
                .then(() => {
                    InstallQueue.clear()
                    modmanager.gui.menu &&
                        sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.UPDATE_ENTRIES)

                    ModInstaller.eventListeners.splice(eventIndex, 1)
                    dialog.blockClosing = false
                    dialog.closeMenu()

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
        dialog.openMenu()
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
        const deps = ModInstaller.getWhatDependsOnAMod(localMod).filter(mod => !mod.uninstalled)
        if (deps.length > 0) {
            sc.Dialogs.showErrorDialog(
                Lang.cannotUninstall.replace(/\[modName\]/, prepareModName(localMod.name)) +
                    deps.map(mod => `- ${yellow}${prepareModName(mod.name)}${white}\n`).join('')
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
                            localMod.uninstalled = true
                            sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.UPDATE_ENTRIES)
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
                deps.map(mod => `- ${yellow}${prepareModName(mod.name)}${white}\n`).join('')
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
                    .replace(/\[mods\]/, deps.map(mod => `- ${yellow}${prepareModName(mod.name)}${white}\n`).join('')),
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
