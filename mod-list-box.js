import { ModListBoxEntry } from './mod-list-box-entry.js';

export const ModListBox = ig.GuiElementBase.extend({
	gfx: new ig.Image("media/gui/menu.png"),
	mods: [],
	modEntries: [],
	buttonGroup: null,
	keyBinder: null,
	bg: null,
	entrySize: 0,
	list: null,
	listContent: null,
	database: null,
	/**
	 * 
	 * @param {import('./moddb').ModDB} database 
	 */
	init(database) {
		this.parent();

		this.database = database;

		this.setSize(436, 258);
		this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);

		this.hook.transitions = {
			DEFAULT: {
				state: {},
				time: 0.2,
				timeFunction: window.KEY_SPLINES.LINEAR
			},
			HIDDEN: {
				state: {
					alpha: 0,
					offsetX: 218
				},
				time: 0.2,
				timeFunction: window.KEY_SPLINES.LINEAR
			}
		};

		let menuPanel = new sc.MenuPanel;
		menuPanel.setSize(436, 258);
		this.addChildGui(menuPanel);

		this.bg = new sc.MenuScanLines;
		this.bg.setSize(436, 258);
		this.addChildGui(this.bg);

		let buttonSquareSize = 14;
		this.entrySize = (buttonSquareSize * 3) + 1;

		this.list = new sc.ButtonListBox(1, 0, this.entrySize);
		this.list.setSize(436, 258);
		this.buttonGroup = this.list.buttonGroup;
		this.addChildGui(this.list);
        
		this.database.getMods()
			.then(mods => {
				this.mods = mods;
				this._createList();
			})
			.catch(err => sc.Dialogs.showErrorDialog(err.message));

		this.doStateTransition("HIDDEN", true);
	},

	_createList() {
		this.mods.forEach(mod => {	
			let newModEntry = new ModListBoxEntry(this.database, mod.id, mod.name, mod.description, mod.versionString, null, this);
			this.modEntries.push(newModEntry);
			this.list.addButton(newModEntry, false);
		});
	},

	addObservers() {
		sc.Model.addObserver(sc.menu, this);
	},

	removeObservers() {
		sc.Model.addObserver(sc.menu, this);
	},

	showMenu() {
		sc.menu.buttonInteract.pushButtonGroup(this.buttonGroup);
		this.keyBinder = new sc.KeyBinderGui;
		ig.gui.addGuiElement(this.keyBinder);
		sc.keyBinderGui = this.keyBinder;
		this.list.activate();
		this.doStateTransition("DEFAULT");
	},

	exitMenu() {
		sc.menu.buttonInteract.removeButtonGroup(this.buttonGroup);
		this.keyBinder.remove();
		sc.keyBinder = null;
		this.list.deactivate();
		this.doStateTransition("HIDDEN");
	},

	modelChanged() {

	},
});
