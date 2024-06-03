import { Lang } from './lang-manager'
import type { Options, Option } from './mod-options'

export const opts = {
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
                        sc.modMenuGui.openRepositoriesPopup()
                    },
                },
                repositories: {
                    type: 'JSON_DATA',
                    init: ['@krypciak', '@krypciak/CCModDB/testing'] as string[],
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
                        sc.modMenuGui.list.updateColumnCount()
                    },
                },
            },
        },
    },
} as const satisfies Options

export let Opts: ReturnType<typeof sc.modMenu.registerAndGetModOptions<typeof opts>>

export function registerOpts() {
    Opts = sc.modMenu.registerAndGetModOptions(
        {
            modId: 'ccmodmanager',
            title: 'CCModManager',
            languageGetter: (_category: string, _header: string, optionId: string, _option: Option): { name: string; description: string } => {
                return Lang.opts[optionId as keyof typeof Lang.opts]
            },
            helpMenu: Lang.help.options,
        },
        opts
    )
}
