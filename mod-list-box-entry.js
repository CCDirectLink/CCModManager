import { ModListBoxEntryHighlight } from './mod-list-box-entry-highlight.js';

export const ModListBoxEntry = ig.FocusGui.extend({
	ninepatch: new ig.NinePatch("media/gui/CCModManager.png", {
		width: 42,
		height: 26,
		left: 1,
		top: 14,
		right: 1,
		bottom: 0,
		offsets: {
			default: {
				x: 0,
				y: 0
			},
			focus: {
				x: 0,
				y: 41
			}
		}
	}),
	nameText: null,
	description: null,
	versionText: null,
	bg: null,
	installRemoveButton: null,
	checkForUpdatesButton: null,
	openModSettingsButton: null,
	installRemoveCallback: null,
	checkForUpdateCallback: null,
	openModSettingsCallback: null,
	modList: null,
	highlight: null,
	modEntryActionButtonStart: {
		height: 14,
		ninepatch: new ig.NinePatch("media/gui/CCModManager.png", {
			left: 5,
			width: 8,
			right: 1,
			top: 11,
			height: 2,
			bottom: 1,
			offsets: {
				default: {
					x: 42,
					y: 82,
				},
				focus: {
					x: 56,
					y: 82,
				},
				pressed: {
					x: 56,
					y: 82,
				}
			}
		}),
		highlight: {
			startX: 70,
			endX: 84,
			leftWidth: 3,
			rightWidth: 1,
			offsetY: 82,
			gfx: new ig.Image("media/gui/CCModManager.png"),
			pattern: new ig.ImagePattern("media/gui/CCModManager.png", 74, 82, 9, 14)
		},
	},
	modEntryActionButtons: {
		height: 14,
		ninepatch: new ig.NinePatch("media/gui/CCModManager.png", {
			left: 1,
			width: 12,
			right: 1,
			top: 1,
			height: 12,
			bottom: 1,
			offsets: {
				default: {
					x: 0,
					y: 82
				},
				focus: {
					x: 14,
					y: 82
				},
				pressed: {
					x: 14,
					y: 82
				}
			}
		}),
		//*
		highlight: {
			startX: 28,
			endX: 42,
			leftWidth: 2,
			rightWidth: 2,
			offsetY: 82,
			gfx: new ig.Image("media/gui/CCModManager.png"),
			pattern: new ig.ImagePattern("media/gui/CCModManager.png", 30, 82, 10, 14, ig.ImagePattern.OPT.REPEAT_X)
		}
		//*/
	},
	init(name, description, versionString, icon, modList) {
		this.parent();
		let buttonSquareSize = 14;
        
		// 3 for the scrollbar
		this.setSize(modList.hook.size.x - 3, modList.entrySize);

		this.modList = modList;

		this.nameText = new sc.TextGui(name);

		this.description = new sc.TextGui(description, {
			font: sc.fontsystem.smallFont
		});

		this.nameText.setPos(4, 0);
		this.description.setPos(4, 14);

		this.versionText = new sc.TextGui(versionString, {
			font: sc.fontsystem.tinyFont
		});

		this.versionText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
		this.versionText.setPos(3, 3);

		// TODO: Icon implementation
		this.icon = icon ? new Image(icon) : void 0;
		this.icon && this.addChildGui(this.icon);

		this.highlight = new ModListBoxEntryHighlight(
			this.hook.size.x,
			this.hook.size.y,
			this.nameText.hook.size.x,
			buttonSquareSize * 3
		);
		this.highlight.setPos(0, 0);
		this.addChildGui(this.highlight);
		this.addChildGui(this.nameText);
		this.addChildGui(this.description);
		this.addChildGui(this.versionText);

		//*
		this.installRemoveButton = new sc.ButtonGui("\\i[mod-config]", buttonSquareSize-1, true, this.modEntryActionButtons);
		this.installRemoveButton.setPos(2, 1);
		this.installRemoveButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM);

		this.checkForUpdatesButton = new sc.ButtonGui("\\i[mod-refresh]", buttonSquareSize-1, true, this.modEntryActionButtons);
		this.checkForUpdatesButton.setPos(this.installRemoveButton.hook.pos.x + this.installRemoveButton.hook.size.x + 1, 1);
		this.checkForUpdatesButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM);

		this.openModSettingsButton = new sc.ButtonGui("\\i[mod-download]", buttonSquareSize-1, true, this.modEntryActionButtonStart);
		this.openModSettingsButton.setPos(this.checkForUpdatesButton.hook.pos.x + this.checkForUpdatesButton.hook.size.x + 1, 1);
		this.openModSettingsButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM);

		[this.installRemoveButton, this.checkForUpdatesButton, this.openModSettingsButton].forEach(button => {
			this.addChildGui(button);
			this.modList.buttonGroup.addFocusGui(button);
			button.focusGained = function() {
				this.focus = true;
				this.hook.parentHook.gui.focusGained();
			}.bind(button);
			button.focusLost = function() {
				this.focus = false;
				this.hook.parentHook.gui.focusLost();
			}.bind(button);
			button.textChild.setPos(1, 3);
		});
		//*/
	},

	updateDrawables(root) {
		if (this.modList.hook.currentStateName != "HIDDEN") {
			this.ninepatch.draw(root, this.hook.size.x, this.hook.size.y, this.focus ? "focus" : "default");
		}
	},

	focusGained() {
		this.parent();
		this.highlight.focus = this.focus;
	},

	focusLost() {
		this.parent();
		this.highlight.focus = this.focus;
	}
});
