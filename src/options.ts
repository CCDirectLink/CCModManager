import { FileCache } from './cache'
import { ModInstallDialogs } from './gui/install-dialogs'
import { Lang } from './lang-manager'
import { LocalMods } from './local-mods'
import { InstallQueue } from './mod-installer'
import type { Option, Options } from './mod-options'
import { ModDB } from './moddb'

export let Opts: ReturnType<typeof modmanager.registerAndGetModOptions<ReturnType<typeof registerOpts>>>

export function registerOpts() {
    const opts = {
        general: {
            settings: {
                tabIcon: 'general',
                title: 'General',
            },
            headers: {
                general: {
                    autoUpdate: {
                        type: 'CHECKBOX',
                        init: true,
                    },
                    repositoriesButton: {
                        type: 'BUTTON',
                        onPress() {
                            modmanager.gui.menu.openRepositoriesPopup()
                        },
                    },
                    resetRepositoriesButton: {
                        type: 'BUTTON',
                        onPress() {
                            Opts.repositories = Opts.flatOpts.repositories.init
                            sc.Dialogs.showInfoDialog(Lang.opts.resetRepositoriesButton.onclickPopup)
                        },
                    },

                    repositories: {
                        type: 'JSON_DATA',
                        init: ['@CCDirectLink/CCModDB/stable', '@CCDirectLink/CCModDB/testing'] as string[],
                        changeEvent() {
                            if (!ig.game) return

                            ModDB.loadDatabases(true)

                            ModDB.loadAllMods(false).then(() => {
                                LocalMods.refreshOrigin()
                            })
                        },
                    },
                    testingOptInMods: {
                        type: 'JSON_DATA',
                        init: [] as string[],
                    },
                    isGrid: {
                        type: 'CHECKBOX',
                        init: false,
                        hidden: true,
                        changeEvent() {
                            if (modmanager.gui.menu.list.currentList) {
                                modmanager.gui.menu.list.restoreLastPosition = undefined
                                modmanager.gui.menu.list.updateColumnCount()
                            }
                        },
                    },
                    hideLibraryMods: {
                        type: 'CHECKBOX',
                        init: true,
                        hidden: true,
                        changeEvent() {
                            modmanager.gui.menu.list.filters['hideLibraryMods'] = Opts.hideLibraryMods
                        },
                    },
                    includeLocalModsInOnline: {
                        type: 'CHECKBOX',
                        init: true,
                        hidden: true,
                        changeEvent() {
                            modmanager.gui.menu.list.filters['includeLocal'] = Opts.includeLocalModsInOnline
                        },
                    },
                    manualEnforcerRead: {
                        type: 'JSON_DATA',
                        init: {} as Record<string, boolean>,
                    },
                },
                advanced: {
                    unpackCCMods: {
                        type: 'CHECKBOX',
                        init: false,
                    },
                    keepChromiumFlags: {
                        type: 'CHECKBOX',
                        init: true,
                    },
                    ignoreCCLoaderMajorVersion: {
                        type: 'CHECKBOX',
                        init: false,
                    },
                    clearCacheButton: {
                        type: 'BUTTON',
                        onPress() {
                            FileCache.deleteOnDiskCache().then(() => {
                                sc.Dialogs.showInfoDialog(Lang.opts.clearCacheButton.onclickPopup)
                            })
                        },
                    },
                    reinstallAllMods: {
                        type: 'BUTTON',
                        onPress() {
                            const reinstallableMods = LocalMods.getAll()
                                .filter(
                                    mod =>
                                        mod.serverCounterpart &&
                                        !mod.isGit &&
                                        !LocalMods.localModFlags[mod.id]?.disableUninstall
                                )
                                .map(mod => mod.serverCounterpart!)

                            for (const mod of reinstallableMods) mod.installStatus = 'update'

                            InstallQueue.add(...reinstallableMods)
                            ModInstallDialogs.showModInstallDialog()
                        },
                    },
                },
            },
        },
    } as const satisfies Options
    Opts = modmanager.registerAndGetModOptions(
        {
            modId: 'ccmodmanager',
            title: 'CCModManager',
            languageGetter: (_category: string, _header: string, optionId: string, _option: Option) => {
                return Lang.opts[optionId as keyof typeof Lang.opts]
            },
            helpMenu: Lang.help.options,
        },
        opts
    )

    return opts
}
