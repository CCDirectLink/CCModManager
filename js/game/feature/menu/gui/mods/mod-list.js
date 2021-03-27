ig.module("game.feature.menu.gui.mods.mod-list").requires(
    "impact.feature.gui.gui"
).defines(function () {

    const icons = new ig.Font("media/font/CCModManagerIcons.png", 12, ig.MultiFont.ICON_START);
    let newFontIndex = sc.fontsystem.font.iconSets.length;
    sc.fontsystem.font.pushIconSet(icons);
    sc.fontsystem.font.setMapping({
        "mod-download": [newFontIndex, 0],
        "mod-config": [newFontIndex, 1],
        "mod-refresh": [newFontIndex, 2],
        "mod-delete": [newFontIndex, 3],
    });

    sc.ModListBox = ig.GuiElementBase.extend({
        gfx: new ig.Image("media/gui/menu.png"),
        mods: [],
        modEntries: [],
        buttonGroup: null,
        keyBinder: null,
        bg: null,
        entrySize: 0,
        list: null,
        listContent: null,
        init(mods) {
            this.parent();

            this.mods = mods;

            this.setSize(436, 258);
            this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);

            this.hook.transitions = {
                DEFAULT: {
                    state: {},
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                HIDDEN: {
                    state: {
                        alpha: 0,
                        offsetX: 218
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
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
            
            this._createList();

            this.doStateTransition("HIDDEN", true);
        },

        _createList() {
            this.mods.forEach(mod => {	
                let newModEntry = new sc.ModListBox.Entry(mod.name, mod.description, mod.versionString, null, this);
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

    sc.ModListBox.Entry = ig.FocusGui.extend({
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

            this.name = new sc.TextGui(name);

            this.description = new sc.TextGui(description, {
                font: sc.fontsystem.smallFont
            });

            this.name.setPos(4, 0);
            this.description.setPos(4, 14);

            this.versionText = new sc.TextGui(versionString, {
                font: sc.fontsystem.tinyFont
            });

            this.versionText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.versionText.setPos(3, 3);

            // TODO: Icon implementation
            this.icon = icon ? new Image(icon) : void 0;
            this.icon && this.addChildGui(this.icon);

            this.highlight = new sc.ModListBox.EntryHighlight(
                this.hook.size.x,
                this.hook.size.y,
                this.name.hook.size.x,
                buttonSquareSize * 3
            );
            this.highlight.setPos(0, 0);
            this.addChildGui(this.highlight);
            this.addChildGui(this.name);
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

    ninepatch: new ig.NinePatch("media/gui/CCModManager.png", {
        left: 3,
        width: 38,
        right: 0,
        top: 14,
        height: 24,
        bottom: 3,
        offsets: {
            default: {
                x: 44,
                y: 0
            },
            focus: {
                x: 44,
                y: 41
            }
        }
    }),

    sc.ModListBox.EntryHighlight = ig.GuiElementBase.extend({
        gfx: new ig.Image("media/gui/CCModManager.png"),
        ninepatch: new ig.NinePatch("media/gui/CCModManager.png", {
            left: 3,
            width: 38,
            right: 0,
            top: 14,
            height: 24,
            bottom: 3,
            offsets: {
                default: {
                    x: 44,
                    y: 0
                },
                focus: {
                    x: 44,
                    y: 41
                }
            }
        }),
        buttonCover: new ig.NinePatch("media/gui/CCModManager.png", {
            left: 4,
            width: 30,
            right: 1,
            top: 14,
            height: 9,
            bottom: 18,
            offsets: {
                default: {
                    x: 51,
                    y: 96
                },
                focus: {
                    x: 7,
                    y: 96,
                }
            }
        }),
        textWidth: null,
        buttonWidth: null,
        highLightOffsetY: 41,

        textTag: new ig.ImagePattern("media/gui/CCModManager.png", 91, 3, 18, 13, ig.ImagePattern.OPT.REPEAT_X),
        textTagHighlighted: new ig.ImagePattern("media/gui/CCModManager.png", 91, 44, 18, 13, ig.ImagePattern.OPT.REPEAT_X),
        focus: false,
        
        init(width, height, textWidth, buttonWidth) {
            this.parent();
            this.setSize(width, height);
            this.textWidth = textWidth;
            this.buttonWidth = buttonWidth;
        },

        updateDrawables(src) {
            this.ninepatch.draw(
                src,
                this.hook.size.x - this.buttonWidth - 6,
                this.hook.size.y + 1,
                this.focus ? "focus" : "default"
            );

            this.buttonCover.draw(
                src,
                this.buttonWidth + 4,
                this.hook.size.y + 1,
                this.focus ? "focus" : "default",
                this.hook.size.x - this.buttonWidth - 6
            );
            
            src.addPattern(
                this.focus ? this.textTagHighlighted : this.textTag,
                3,
                3,
                90,
                0,
                this.textWidth,
                13,
            );

            src.addGfx(
                this.gfx,
                this.textWidth + 3,
                3,
                109,
                this.focus ? 44 : 3,
                6,
                13
            );
        }
    });
});