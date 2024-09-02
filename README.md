<!-- markdownlint-disable MD013 MD024 MD001 MD045 -->
# CCModManager
 
Mod manager for the game CrossCode!  
Open the menu from the options menu and look for the `Mods` button.  
Read the in-game manual in the help menu for usage instructions.  

![Mod icon grid](https://github.com/user-attachments/assets/9eabd8e1-dbfc-4127-82cd-6a30cf45d1d3)


## Screenshots

![Screenshot of the Online tab sorted by the mod star count](https://github.com/CCDirectLink/CCModManager/assets/115574014/1ce0fb39-d993-46b2-b25f-0acbe8e7a0a2)

![Screenshot of the mod options submenu for the mod CrossedEyes](https://github.com/CCDirectLink/CCModManager/assets/115574014/af70c5d4-058f-4042-8fb7-b26bd279af10)


## For mod developers

### Registering your mod

Examples:
- [cc-fancy-crash](https://github.com/krypciak/cc-fancy-crash/blob/main/src/options.ts) as a example of BUTTON_GROUP and CHECKBOX
- [cc-record](https://github.com/krypciak/cc-record/blob/main/src/options.ts) as a example of OBJECT_SLIDER and CONTROLS
- [CCModManager](https://github.com/CCDirectLink/CCModManager/blob/master/src/options.ts) as an example of JSON_DATA and BUTTON
- [CrossedEyes](https://github.com/CCDirectLink/CrossedEyes/blob/master/src/options.ts) as an example of a big multi-tab menu with a custom language getter

#### Building CCModManager

```bash
git clone https://github.com/CCDirectLink/CCModManager
cd CCModManager
pnpm install
pnpm run start
# this should return no errors (hopefully)
npx tsc
```
