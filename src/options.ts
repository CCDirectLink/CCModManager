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
                            modmanager.gui.modMenuGui.openRepositoriesPopup()
                        },
                    },
                    repositories: {
                        type: 'JSON_DATA',
                        init: ['@krypciak', '@krypciak/CCModDB/testing'] as string[],
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
                            modmanager.gui.modMenuGui.list.updateColumnCount()
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
