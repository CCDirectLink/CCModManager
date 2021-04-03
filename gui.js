import { ModMenu } from './mod-menu.js';

const icons = new ig.Font("media/font/CCModManagerIcons.png", 12, ig.MultiFont.ICON_START);
const newFontIndex = sc.fontsystem.font.iconSets.length;
sc.fontsystem.font.pushIconSet(icons);
sc.fontsystem.font.setMapping({
	"mod-download": [newFontIndex, 0],
	"mod-config": [newFontIndex, 1],
	"mod-refresh": [newFontIndex, 2],
	"mod-delete": [newFontIndex, 3],
});

sc.MENU_SUBMENU.MODS = Math.max(...Object.values(sc.MENU_SUBMENU)) + 1;

sc.SUB_MENU_INFO[sc.MENU_SUBMENU.MODS] = {
	Clazz: ModMenu,
	name: "mods"
};

sc.TitleScreenButtonGui.inject({
	modsButton: null,

	postInit: function() {
		this.parent();

		this.modsButton = new sc.ButtonGui("\\i[help2]" + ig.lang.get("sc.gui.title-screen.mods"), null, true, sc.BUTTON_TYPE.EQUIP);
		this.modsButton.hook.transitions = {
			DEFAULT: {
				state: {},
				time: 0.2,
				timeFunction: window.KEY_SPLINES.EASE
			},
			HIDDEN: {
				state: {
					offsetY: -(this.changelogButton.hook.size.y + 4)
				},
				time: 0.2,
				timeFunction: window.KEY_SPLINES.LINEAR
			}
		};
		this.modsButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
		this.modsButton.setHeight(26);
		this.modsButton.textChild.setPos(0, -1);
		this.modsButton.setPos((ig.extensions.getExtensionList().length > 0 ? this.dlcButton.hook.size.x + 6 : 0) + this.changelogButton.hook.size.x + 6, 2);
		this.modsButton.doStateTransition("HIDDEN", true);
		this.modsButton.onButtonPress = function() {
			this._enterModsMenu();
		}.bind(this);
		this.buttonInteract.addGlobalButton(this.modsButton, function() {
			return sc.control.menuHotkeyHelp2();
		}.bind(this));
		this.addChildGui(this.modsButton);
	},

	_enterModsMenu() {
		sc.menu.setDirectMode(true, sc.MENU_SUBMENU.MODS);
		sc.model.enterMenu(true);
	},

	show() {
		this.parent();
		this.modsButton && this.modsButton.doStateTransition("DEFAULT");
	},

	hide() {
		this.parent();
		this.modsButton && this.modsButton.doStateTransition("HIDDEN");
	}
});
