<!-- markdownlint-disable MD013 MD024 MD001 MD045 -->
# CCModManager
 
Mod manager for the game CrossCode!  
Read the in-game manual in the help menu for usage instructions.  

## Screenshots



## For mod developers

### Registering your mod

Examples:
- [cc-fancy-crash](https://github.com/krypciak/cc-fancy-crash/blob/main/src/options.ts) as a example of BUTTON_GROUP and CHECKBOX
- [cc-record](https://github.com/krypciak/cc-record/blob/main/src/options.ts) as a example of OBJECT_SLIDER and CONTROLS
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
