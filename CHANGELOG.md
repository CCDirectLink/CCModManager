<!-- markdownlint-disable MD013 MD024 -->

# Change Log

## [Unreleased]

### Fixed

- Improve browser compatibility
- Improve menu opening performance
- Fix mod icon loading sometimes throwing errors on CCLoader3
- Improve compatibility with CrossCode v1.0.2-2 (speedrunner branch)

## [1.0.4] 2025-06-26

### Added

- Added new mod option type `INPUT_FIELD`

### Changed

- Move repository adding from a popup to a separate tab in CCModManager's options
- Move `nax.ccuilib.InputField` implementation from `nax-ccuilib` to here (now named `modmanager.gui.InputField`)

### Fixed

- Improve browser compatibility
- Fix mod menu sometimes opening empty
- Improve cc-instanceinator compatibility
- Fix mod options menu title showing the mod title instead of the title defined when registering the mod

## [1.0.3] 2025-02-16

### Changed

- Library mods are now shown by default
- Also print the extension name when it's missing and a mod requires it
- For CCLoader3, the mod installation dir is now `modloader.config.modsDirs`
- Improved behavior when there's no internet

### Fixed

- Close mod installation menu on error

## [1.0.2] 2024-10-31

### Added

- Left clicking a mod in the Settings tab opens the mod's settings menu
- Add "preventResettingToDefault" property on changeable options
- Add "thumbWidth" property on OBJECT_SLIDER

### Changed 

- OBJECT_SLIDER thumb size now has a minimum of 30px
- On game start, all OBJECT_SLIDER values will be put in their bounds

### Fixed

- Left clicking a mod in the Settings tab doesn't crash anymore
- Fix crash when clicking the "Reset Settings" button some mod's setting page
- Fix top bar buttons like "Help" becoming uninteractable after resetting the mod's settings
- Fix OBJECT_SLIDER not working properly with floating point numbers

## [1.0.1] 2024-10-28

### Changed 

- Clarify the intent in the game start autoupdate prompt

### Fixed

- Fix mod list not loading in some very specific cases

## [1.0.0] 2024-09-19

### Changed

- Update the mod repositories to the official (CCDirectLink/CCModDB) from the testing one (krypciak/CCModDB)

### Fixes

- Force CCLoader to update first before any other mods

## [0.9.22] 2024-09-15

### Added

- Added a tab for mods that have a dedicated settings page

### Changed

- Remember the "Include local" and "Hide library mods" filter options across game restarts
- Make the manual enforcer less annoying

### Fixed

- Fixed CCLoader sometimes getting detected as not installed

## [0.9.21] 2024-08-20

### Added

- Enforce the manual on all souls

### Changed

- Mod options can now also be opened with mouse right click

### Fixed

- Fixed mod settings and testing buttons being unpresssable on gamepad when the gamepad bindings are changed

## [0.9.20] 2024-08-11

### Changed

- Decrease mod size
- Prevent backspace from quitting the mod manager menu
- Keep list scroll when entering the mod's options
- `onPress` and `changeEvent` functions on option entries: `this` is now bound to the option config

### Fixed

- Prevent CCLoader downgrade attempts when using CCLoader3 and downloading a mod that requires CCLoader2
- Prevent Simplify from installing when using CCLoader3
- Fixed space being disabled in every menu, not just the mod manager
- Fixed mod list being unresponsive after exiting out of the filters menu
- Fixed the mod's options menu sometimes failing to open on keyboard and mouse

## [0.9.19] 2024-08-09

### Added

- Added mod installation progress indication

### Changed

- Revert the button order in the mod uninstallation popup to "YES NO" from "NO YES"

### Fixed

- Fixed the mod menu sometimes being blank when reopening it
- Block exiting from the mod install menu with keys such as escape
- Don't block dependency mod uninstalling when all parent mods have been uninstalled in the current session
- Disallow installing mods that depend on missing extensions (such as DLC)

## [0.9.18] 2024-08-08

### Added
 
- Added the "Reset repositories to default" button to the CCModManager options
- Added the "Clear database cache" button to the CCModManager options
- Added a checkbox to keep chromium flags on CCLoader update to the CCModManager options
- Added a checkbox to unpack installed or updated `.ccmod` mods to the CCModManager options
- Added a button to reinstall all installed mods to the CCModManager options
- Added the "Visit release page" button to the mod changelog menu

### Changed

- Removed the "v" before from the mod update dialog for consistency

### Fixed

- Fixed filters menu back button not being clickable by mouse + other weirdness
- Fixed manual updating of pre-release mods
- Fixed mod options BUTTON y spacing
- Fixed mod installation successful dialog poping up before the installation finished
- Prevent mod description and mod tags overlapping each other
- Fixed the confirmation buttons for the mod installation prompt getting off-screen when the mod list is too big
- Improved ccloader3 compatibility

## [0.9.17] 2024-08-05

### Added

- Added the mod changelog menu

## [0.9.16] 2024-07-29

### Changed

- Update the mod database endpoint

## [0.9.15] 2024-06-27

### Fixed

- Fixed crash when switching buttons using a mouse on BUTTON_GROUP 

## [0.9.14] 2024-06-13
## [0.9.13] 2024-06-12
## [0.9.12] 2024-06-10

### Added

- Added a 'Visit repository' button
- Added a per-mod options sub-menu

### Changed

- The mod manager is now available in demo versions of the game generated by [crosscode-demonizer](https://github.com/krypciak/crosscode-demonizer), but the online tab is unavailable

## [0.9.11] 2024-05-18

### Added

- Added testing branch support

### Changes

- Mod installation dialog now displays versions

## [0.9.10] 2024-04-20

### Added

- Added mod sha256 digest verification

### Fixed

- Fixed game extensions not being handled

## [0.9.9] 2024-03-17

### Changed

- Always use small font for the grid view

### Fixed

- Fixed mod list sorting on enabled and disabled tabs
- Fixed mod last update date not showing on local mods
- Fixed tag list clipping out of the mod entry box when the tag list too long

## [0.9.8] 2024-03-13

## [0.9.7] 2024-03-12

## [0.9.6] 2024-03-12

## [0.9.5] 2024-03-10

## [0.9.4] 2024-03-10

## [0.9.3] 2024-03-05

## [0.9.2] 2024-03-04

## [0.9.1] 2024-03-04

## [0.9.0] 2024-02-25

## [0.8.3] 2024-02-23

## [0.8.0] 2024-02-23
