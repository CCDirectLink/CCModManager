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

Option types:
- `CHECKBOX`
```javascript
{
    type: 'CHECKBOX',
    init: true,
    /* optional */ changeEvent() {
        // code
    }
}
```

- `BUTTON_GROUP`
```javascript
{
    type: 'BUTTON_GROUP',
    init: 0 /* option1 */,
    enum: { option1: 0, option2: 1 },
    buttonNames: ['Option 1', 'Option 2'],
}
```

```javascript
// Or with an enum variable
const myenum = {
    option1: 0,
    option2: 1,
}
/// ...
{
    type: 'BUTTON_GROUP',
    init: myenum.option1 /* option1 */,
    enum: myenum,
    buttonNames: ['Option 1', 'Option 2'],
}
```

- `OBJECT_SLIDER`
```javascript
{
    // Creates a slider that displays values from 1 to 8
    type: 'OBJECT_SLIDER',
    init: 1,
    min: 0.8,
    max: 1.5,
    step: 0.1,
    fill: true,
    showPercentage: false,
    name: 'Slider',
    description: 'My somewhat favorite slider.',
}
```

```javascript
{
    // Creates a slider that displays values from 1 to 8
    type: 'OBJECT_SLIDER',
    init: 0.5,
    min: 0,
    max: 1,
    step: 0.1,
    fill: true,
    showPercentage: true,
    name: 'Percentage slider',
    description: 'My (maybe) somewhat favorite slider.',
}
```

```javascript
{
    // Creates a slider that displays values from 4 to 13 
    type: 'OBJECT_SLIDER',
    init: 7,
    min: 4,
    max: 13,
    step: 1,
    fill: true,
    customNumberDisplay(index) {
        const num: number = this.min
        return num + index
    },
    name: 'Number slider',
    description: 'My (definitely) somewhat favorite slider.',
}
```

- `BUTTON`
```javascript
{
    type: 'BUTTON',
    onPress() {
        // code
    },
    name: 'Button',
    description: 'My favorite button.',
}
```

- `INFO`
```javascript
{
    type: 'INFO',
    name: 'Hello to all!\n<-- New line.'
}
```

- `CONTROLS`
```javascript
{
    type: 'CONTROLS',
    init: { key1: ig.KEY.I },
    // If false, the keybinding only works in-game
    // If true, the keybinding works everywhere
    global: false,
    pressEvent() {
        // keybinding pressed! I will trigger only once
        // code
    },
    holdEvent() {
        // keybinding is pressed now! I will trigger every frame the key is pressed
        // code
    },
    name: 'My keybinding',
    description: 'Does something I guess.',
}
```

- `JSON_DATA`
```javascript
{
    type: 'JSON_DATA',
    init: 123,
    /* optional */ changeEvent() {
        // code
    }
}
```


Javascript example:
```javascript
// for typescript:
// import type * as _ from 'ccmodmanager/types/plugin'

const Opts = modmanager.registerAndGetModOptions(
    {
        // TODO: change
        modId: 'cc-ts-template-esbuild', // the same as the `id` field in `ccmod.json`
        title: 'My mod', // the same as the `title` field in `ccmod.json`
    },
    {
        general: {
            settings: {
                title: 'General', // tab title
                tabIcon: 'general', // icon id
            },
            headers: {
                'My header title': {
                    myCheckbox: {
                        type: 'CHECKBOX',
                        init: true,
                        name: 'My checkbox',
                        description: "It's initialized as true by default.",
                    },
                    myEnum: {
                        type: 'BUTTON_GROUP',
                        init: 0 /* option1 */,
                        enum: { option1: 0, option2: 1 },
                        buttonNames: ['Option 1', 'Option 2'],
                        name: 'My buttons',
                        description: 'Hello.',
                    },
                    mySlider: {
                        // Creates a slider with the following values:
                        // 0.8 0.9 1.0 1.1 1.2 1.3 1.4 1.5
                        type: 'OBJECT_SLIDER',
                        init: 1,
                        min: 0.8,
                        max: 1.5,
                        step: 0.1,
                        fill: true,
                        showPercentage: false /* Show the values as % (example: 0.9 => 90%) */,
                        name: 'Slider',
                        description: 'My somewhat favorite slider.',
                    },
                    myButton: {
                        type: 'BUTTON',
                        onPress() {
                            console.log('Button presssed!')
                        },
                        name: 'Button',
                        description: 'My favorite button.',
                    },
                    myInfo: {
                        type: 'INFO',
                        name: 'Hello!',
                    },
                    myKeybinding: {
                        type: 'CONTROLS',
                        init: { key1: ig.KEY.I },
                        // If false, the keybinding only works in-game
                        // If true, the keybinding works everywhere
                        global: false,
                        pressEvent() {
                            console.log('keybinding pressed!')
                        },
                        name: 'Keybinding',
                        description: 'Does something I guess.',
                    },

                    // JSON_DATA is not visible in the menu
                    myNumberStorage: {
                        type: 'JSON_DATA',
                        init: 123,
                    },
                    myJsonStorage: {
                        type: 'JSON_DATA',
                        init: { a: 1, b: 2, c: 3 },
                    },
                },
            },
        },
    }
)

// Usage
Opts.myCheckbox // boolean
Opts.myEnum // 0 | 1
Opts.mySlider // 0.8 | 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5
// Opts.myInfo is not accessible, since it does not store data
// Opts.myKeybinding is not accessible, since it does not store data

Opts.myNumberStorage // number
Opts.myJsonStorage.a // number
Opts.myJsonStorage.b // number
Opts.myJsonStorage.c // number
/* Invalid code: */
// Opts.myJsonStorage.a = 2 // The stored data is read-only, you need to override the whole object
/* This is how you do it: */
Opts.myJsonStorage = { ...Opts.myJsonStorage, a: 2 }
```

Other examples (in Typescript):
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
