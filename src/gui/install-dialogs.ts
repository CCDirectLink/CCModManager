import { Lang } from '../lang-manager'
import { LocalMods } from '../local-mods'
import { InstallQueue, ModInstaller } from '../mod-installer'
import type { ModInstallerDownloadingProgress } from '../mod-installer'
import type { ModEntry, ModEntryLocal, ModEntryServer } from '../types'
import { wrapInColor } from './colors'
import { prepareModName } from '../misc-functions'

function getModListStr(mods: { name: string }[]) {
    return mods.map(mod => `- ` + wrapInColor('YELLOW', prepareModName(mod)) + ` \n`).join('')
}

declare global {
    namespace modmanager.gui {
        var ModInstallDialogs: ModInstallDialogs
    }
}

class ModInstallDialogs {
    async installModsFunc(dialog: modmanager.gui.MultiPageButtonBoxGui, modCount: number, autoupdate?: boolean) {
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
                        statusStr =
                            `Downloading... ` +
                            wrapInColor('YELLOW', (progress.received / scale).round(0)) +
                            `/` +
                            wrapInColor('YELLOW', (progress.length / scale).round(0)) +
                            ` ${unit}`
                    } else if (status == STATUS.installing) {
                        statusStr = 'Installing...'
                    } else {
                        statusStr = wrapInColor('GREEN', 'Done')
                    }

                    return wrapInColor('YELLOW', mod.id) + ` ${mod.version} - ${statusStr}`
                })
                .join('\n')

            dialog.setPageText(0, [str])
            dialog.refreshPage()
        }

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
        try {
            await ModInstaller.install(toInstall)
        } catch (err) {
            sc.Dialogs.showErrorDialog(err as Error)
            dialog.blockClosing = false
            dialog.closeMenu()
            return
        }

        InstallQueue.clear()
        if (modmanager.gui.menu)
            sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.UPDATE_ENTRIES)

        ModInstaller.eventListeners.splice(eventIndex, 1)
        dialog.blockClosing = false
        dialog.closeMenu()

        sc.BUTTON_SOUND.shop_cash.play()

        if (!autoupdate) {
            for (const mod of toInstall) {
                const { deps } = LocalMods.findDeps(mod)
                const inactiveDependencies = [...deps].filter(mod => !mod.active)
                if (inactiveDependencies.length > 0) {
                    await this.showEnableModDialog(mod as unknown as ModEntryLocal)
                }
            }
        }

        if ((await this.showYesNoDialog(Lang.askRestartInstall, sc.DIALOG_INFO_ICON.QUESTION)) == 0) {
            ModInstaller.restartGame()
        } else {
            for (const mod of toInstall) {
                mod.awaitingRestart = true
            }
        }
    }

    showModInstallDialog(autoupdate?: boolean) {
        const deps = InstallQueue.values().filter(mod => mod.installStatus == 'dependency')
        const toInstall = InstallQueue.values().filter(mod => mod.installStatus == 'new')
        const toUpdate = InstallQueue.values().filter(mod => mod.installStatus == 'update')
        if (deps.length == 0 && toInstall.length == 0 && toUpdate.length == 0) return

        function modsToStr(mods: ModEntry[]) {
            return mods
                .map(mod => {
                    const localVersion = LocalMods.getAllRecord()[mod.id]?.version
                    return (
                        `- ` +
                        wrapInColor('YELLOW', prepareModName(mod)) +
                        ` ${localVersion ? `${localVersion} -> ` : ''}${mod.version}\n`
                    )
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
                onPress: () => {
                    this.installModsFunc(dialog, modCount, autoupdate)
                },
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

        dialog.openMenu()
    }

    showAutoUpdateDialog() {
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
                    this.showModInstallDialog(true)
                } else {
                    InstallQueue.clear()
                }
            }
        )
    }

    showModUninstallDialog(localMod: ModEntryLocal): boolean {
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

        ;(async () => {
            if ((await this.showYesNoDialog(str, sc.DIALOG_INFO_ICON.QUESTION)) == 0) {
                try {
                    await ModInstaller.uninstallMod(localMod)
                } catch (err) {
                    sc.Dialogs.showErrorDialog(err as Error)
                }

                localMod.awaitingRestart = true
                localMod.active = false
                localMod.uninstalled = true
                if (modmanager.gui.menu)
                    sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.UPDATE_ENTRIES)
                sc.BUTTON_SOUND.shop_cash.play()

                if ((await this.showYesNoDialog(Lang.askRestartUninstall, sc.DIALOG_INFO_ICON.QUESTION)) == 0) {
                    ModInstaller.restartGame()
                }
            }
        })()
        return true
    }

    checkCanDisableMod(mod: ModEntryLocal): boolean {
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

    async showEnableModDialog(mod: ModEntryLocal) {
        const deps = await this.checkCanEnableMod(mod)
        if (deps === undefined) return
        deps.add(mod)
        for (const mod of deps) {
            mod.awaitingRestart = !mod.awaitingRestart
            sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.ENTRY_UPDATE_COLOR, {
                mod,
                color: 'GREEN',
            })
            sc.BUTTON_SOUND.toggle_on.play()
            LocalMods.setModActive(mod, true)
        }
    }

    async checkCanEnableMod(mod: ModEntry): Promise<Set<ModEntryLocal> | undefined> {
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

        if (
            (await this.showYesNoDialog(
                Lang.doYouWantToEnable
                    .replace(/\[modName\]/, prepareModName(mod))
                    .replace(/\[mods\]/, getModListStr(toEnableArr)),
                sc.DIALOG_INFO_ICON.QUESTION
            )) == 0
        ) {
            return toEnable
        } else {
            return undefined
        }
    }

    showYesNoDialog(text: sc.TextLike, icon?: Nullable<sc.DIALOG_INFO_ICON>): Promise<number> {
        return new Promise<number>(resolve => {
            sc.Dialogs.showYesNoDialog(text, icon, button => resolve(button.data))
        })
    }
}

modmanager.gui.ModInstallDialogs = new ModInstallDialogs()
