ig.module("game.feature.menu.gui.mods.mod-menu")
.requires(
    "impact.feature.gui.gui",
    "game.feature.menu.gui.base-menu"
).defines(function () {
    sc.ModMenu = sc.BaseMenu.extend({
        modList: null,
        init() {
            this.parent();
            this.hook.size.x = ig.system.width;
            this.hook.size.y = ig.system.height;

            this.modList = new sc.ModListBox([
                {name: "CCModManager", description: "An integrated mod manager for CrossCode", versionString: "v0.0.1"},
                {name: "CCInventorySearch", description: "Inventory search mod", versionString: "v1.0.0"},
                {name: "CCFillerText", description: "Lorem ipsum something or other", versionString: "v0.0.1"},
                {name: "CCModManager", description: "An integrated mod manager for CrossCode", versionString: "v0.0.1"},
                {name: "CCModManager", description: "An integrated mod manager for CrossCode", versionString: "v0.0.1"},
                {name: "CCModManager", description: "An integrated mod manager for CrossCode", versionString: "v0.0.1"},
                {name: "CCModManager", description: "An integrated mod manager for CrossCode", versionString: "v0.0.1"},
                {name: "CCModManager", description: "An integrated mod manager for CrossCode", versionString: "v0.0.1"},
                {name: "CCModManager", description: "An integrated mod manager for CrossCode", versionString: "v0.0.1"}
            ]);
            this.addChildGui(this.modList);

            this.doStateTransition("DEFAULT", true);
        },

        showMenu() {
            this.addObservers();
            sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
            sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.HIDDEN);
            this.modList.showMenu();
        },

        hideMenu() {
            this.removeObservers();
            sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.LARGE);
            this.exitMenu();
        },

        exitMenu() {
            this.modList.exitMenu();
        },

        addObservers() {
            sc.Model.addObserver(sc.menu, this);
            this.modList.addObservers();
        },

        removeObservers() {
            sc.Model.removeObserver(sc.menu, this);
            this.modList.removeObservers();
        },

        onBackButtonPress() {
            sc.menu.popBackCallback();
            sc.menu.popMenu();
        },

        modelChanged(sender, event, data) {

        }
    });
    sc.MENU_SUBMENU["MODS"] = Math.max(...Object.values(sc.MENU_SUBMENU)) + 1;

    sc.SUB_MENU_INFO[sc.MENU_SUBMENU.MODS] = {
        Clazz: sc.ModMenu,
        name: "mods"
    }

    sc.TitleScreenButtonGui.inject({
        modsButton: null,
        init() {
            this.parent();

            let optionsButtonY = this.buttons[1].hook.pos.y;

            this.buttons.slice(1).forEach(button => {
                button.setPos(button.hook.pos.x, button.hook.pos.y + 28); // 28, button height + padding
            });

            this.modsButton = this._createButton("mods", optionsButtonY, 6, function () {
                this._enterModsMenu();
            }.bind(this), "mods");

            this.doStateTransition("DEFAULT", true);
        },

        _enterModsMenu() {
            sc.menu.setDirectMode(true, sc.MENU_SUBMENU.MODS);
            sc.model.enterMenu(true);
        }
    });
});