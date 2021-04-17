import { ModListBox } from './mod-list-box.js';
import { ModDB } from './moddb.js';

export const ModMenu = sc.BaseMenu.extend({
	modList: null,
	database: null,
	init() {
		this.parent();
		this.hook.size.x = ig.system.width;
		this.hook.size.y = ig.system.height;

		this.database = new ModDB();

		this.modList = new ModListBox(this.database);
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