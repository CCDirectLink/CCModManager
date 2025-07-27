import { Lang } from '../lang-manager'
import { LocalMods } from '../local-mods'
import { InstallQueue, ModInstaller, ModInstallerDownloadingProgress } from '../mod-installer'
import { ModEntry, ModEntryLocal, ModEntryServer } from '../types'

export function prepareModName(mod: { name: string }) {
    return mod.name.replace(/\\c\[\d]/g, '').trim()
}

function getModListStr(mods: { name: string }[]) {
    return mods.map(mod => `- ${yellow}${prepareModName(mod)}${white}\n`).join('')
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
                    return `- ${yellow}${prepareModName(mod)}${white} ${localVersion ? `${localVersion} -> ` : ''}${mod.version}\n`
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

            // @ts-ignore allow cc-instanceinator to hook sc.Dialogs.showYesNoDialog
            sc.Dialogs.id = window.instanceinator?.id

            const toInstall = InstallQueue.values()
            ModInstaller.install(toInstall)
                .then(() => {
                    InstallQueue.clear()
                    if (modmanager.gui.menu)
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
                    sc.Dialogs.showErrorDialog(err)
                    dialog.blockClosing = false
                    dialog.closeMenu()
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
                Lang.errors.cannotUninstallDisabled.replace(/\[modName\]/, prepareModName(localMod))
            )
            return false
        }
        if (localMod.isGit) {
            sc.Dialogs.showErrorDialog(Lang.errors.cannotUninstallGit.replace(/\[modName\]/, prepareModName(localMod)))
            return false
        }
        const deps = ModInstaller.getWhatDependsOnAMod(localMod).filter(mod => !mod.uninstalled)
        if (deps.length > 0) {
            sc.Dialogs.showErrorDialog(
                Lang.errors.cannotUninstall.replace(/\[modName\]/, prepareModName(localMod)) + getModListStr(deps)
            )
            return false
        }
        const str = Lang.areYouSureYouWantToUninstall.replace(/\[modName\]/, prepareModName(localMod))
        sc.Dialogs.showChoiceDialog(
            str,
            sc.DIALOG_INFO_ICON.QUESTION,
            [ig.lang.get('sc.gui.dialogs.yes'), ig.lang.get('sc.gui.dialogs.no')],
            button => {
                // @ts-ignore allow cc-instanceinator to hook sc.Dialogs.showYesNoDialog
                sc.Dialogs.id = window.instanceinator?.id

                if (button.data == 0) {
                    ModInstaller.uninstallMod(localMod)
                        .then(() => {
                            localMod.awaitingRestart = true
                            localMod.active = false
                            localMod.uninstalled = true
                            if (modmanager.gui.menu)
                                sc.Model.notifyObserver(
                                    modmanager.gui.menu,
                                    modmanager.gui.MENU_MESSAGES.UPDATE_ENTRIES
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
            sc.Dialogs.showErrorDialog(Lang.errors.cannotDisableDisabled.replace(/\[modName\]/, prepareModName(mod)))
            return false
        }
        const deps = ModInstaller.getWhatDependsOnAMod(mod, true)
        if (deps.length == 0) return true
        sc.Dialogs.showErrorDialog(
            Lang.errors.cannotDisable.replace(/\[modName\]/, prepareModName(mod)) + getModListStr(deps)
        )
        return false
    }

    static async checkCanEnableMod(mod: ModEntryLocal): Promise<Set<ModEntryLocal> | undefined> {
        const { deps, missing } = LocalMods.findDeps(mod)
        if (missing.size > 0) {
            sc.Dialogs.showErrorDialog(
                Lang.errors.cannotEnableMissingDeps.replace(/\[modName\]/, prepareModName(mod)) +
                    getModListStr([...missing].map(id => ({ name: id })))
            )
            return undefined
        }

        const toEnableArr = [...deps].filter(mod => !mod.active)
        const toEnable = new Set(toEnableArr)

        if (toEnable.size == 0) return toEnable

        return new Promise<Set<ModEntryLocal> | undefined>(resolve => {
            sc.Dialogs.showYesNoDialog(
                Lang.doYouWantToEnable
                    .replace(/\[modName\]/, prepareModName(mod))
                    .replace(/\[mods\]/, getModListStr(toEnableArr)),
                sc.DIALOG_INFO_ICON.QUESTION,
                button => {
                    if (button.data == 0) {
                        resolve(toEnable)
                    } else {
                        resolve(undefined)
                    }
                }
            )
        })
    }
}
