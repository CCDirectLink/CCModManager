import { FileCache } from './cache'
import { Lang } from './lang-manager'
import { LocalMods } from './local-mods'
import type { Options, Option } from './mod-options'
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
                        init: ['@krypciak/CCModDB/stable', '@krypciak/CCModDB/testing'] as string[],
                        changeEvent() {
                            ModDB.loadDatabases(true)

                            ModDB.loadAllMods(() => {
                                LocalMods.refreshOrigin()
                            }, false)
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
                            modmanager.gui.menu.list.updateColumnCount()
                        },
                    },
                },
                advanced: {
                    keepChromiumFlags: {
                        type: 'CHECKBOX',
                        init: true,
                    },
                    clearCacheButton: {
                        type: 'BUTTON',
                        onPress() {
                            FileCache.deleteOnDiskCache().then(() => {
                                sc.Dialogs.showInfoDialog(Lang.opts.clearCacheButton.onclickPopup)
                            })
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
