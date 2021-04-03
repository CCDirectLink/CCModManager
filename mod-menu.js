import { ModListBox } from './mod-list-box.js';

export const ModMenu = sc.BaseMenu.extend({
	modList: null,
	init() {
		this.parent();
		this.hook.size.x = ig.system.width;
		this.hook.size.y = ig.system.height;

		this.modList = new ModListBox([
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

	modelChanged() {

	}
});