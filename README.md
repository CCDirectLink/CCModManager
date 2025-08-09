<!-- markdownlint-disable MD013 MD024 MD001 MD045 -->
# CCModManager
 
Mod manager for the game CrossCode!  
Open the menu from the options menu and look for the `Mods` button.  
Read the in-game manual in the help menu for usage instructions.  

![Mod icon grid](https://github.com/user-attachments/assets/5733188c-7f71-44fe-803e-18165421dd21)

## Screenshots

![Screenshot of the Online tab sorted by the mod star count](https://github.com/user-attachments/assets/e824aa81-4840-4244-b456-9837ac0cec5c)
![Screenshot of the Online tab with grid mode enabled](https://github.com/user-attachments/assets/efc5716a-7aeb-4a2a-9643-2d4a7fd6ee06)
![Screenshot of the mod options submenu for the mod CCModManager](https://github.com/user-attachments/assets/ed49278d-f2dc-45b6-98c5-f3c91591589c)

# For mod developers

You can define custom options pages for your own mod.  
See full example below.  

# Option types

## `CHECKBOX`

![image](https://github.com/user-attachments/assets/bf8bcaf1-9a0e-41cf-8314-58273a1ef467)

```javascript
{
    type: 'CHECKBOX',
    init: true,
    changeEvent() { /* optional */
        // code
    },
    name: 'My checkbox',
    description: 'My least favorite button.',
}
```

## `BUTTON_GROUP`

![image](https://github.com/user-attachments/assets/ec58b7a0-1d6a-4208-80fa-ba16996cff12)

```javascript
{
    type: 'BUTTON_GROUP',
    init: 0 /* option1 */,
    enum: { option1: 0, option2: 1 },
    buttonNames: ['Option 1', 'Option 2'],
    name: 'My buttons',
    description: 'My (not really) favorite button group.',
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
    name: 'My buttons',
    description: 'My beloved button group.',
}
```

## `OBJECT_SLIDER`

![image](https://github.com/user-attachments/assets/bc9d4b03-9741-405a-aec7-e439dcc8fc13)
  
```javascript
{
    // Creates a slider that displays values from 1 to 8
    type: 'OBJECT_SLIDER',
    init: 1,
    min: 0.8,
    max: 1.5,
    step: 0.1,
    fill: true,
    name: 'Slider',
    description: 'My somewhat favorite slider.',
}
```

![image](https://github.com/user-attachments/assets/6d0fbfff-9629-4535-8e70-d4c370559416)

```javascript
{
    // Creates a slider that displays values from 0% to 100%
    type: 'OBJECT_SLIDER',
    init: 0.5,
    min: 0,
    max: 1,
    step: 0.1,
    fill: true,
    showPercentage: true,
    thumbWidth: 50, // Force the thumb width to 50px
    name: 'Percentage slider',
    description: 'My (maybe) somewhat favorite slider.',
}
```


![image](https://github.com/user-attachments/assets/0a6c79c5-4bc0-4049-8ae8-77577169c4ad)

```javascript
{
    // Creates a slider that displays values from 4 to 13 
    type: 'OBJECT_SLIDER',
    init: 7,
    min: 4,
    max: 13,
    step: 1,
    fill: true,
    // note: when using typescript, you need to specify
    // the return type of this function manually
    customNumberDisplay(index) {
        return this.min + index
    },
    name: 'Number slider',
    description: 'My (definitely) somewhat favorite slider.',
}
```

## `BUTTON`

![image](https://github.com/user-attachments/assets/d77958cf-0f07-4458-88b3-186fb69b6b75)

```javascript
{
    type: 'BUTTON',
    onPress(button) {
        // code
        // you can update the button text as you please
        button.setText("hi!!")
    },
    name: 'Button',
    description: 'My favorite button.',
}
```

## `INFO`

![image](https://github.com/user-attachments/assets/3b2d99ca-4c1f-4747-bbfe-3535d00cf19b)

```javascript
{
    type: 'INFO',
    name: 'Hello to all!\n<-- New line.'
}
```

## `CONTROLS`
  
![image](https://github.com/user-attachments/assets/9ca704ba-84bb-496c-a74c-d6072bc7341a)

```javascript
{
    type: 'CONTROLS',
    init: { key1: ig.KEY.I },
    // If false, the keybinding only works in-game
    // If true, the keybinding works everywhere
    global: false, /* optional, false by default */
    pressEvent() { /* optional */
        // keybinding pressed! I will trigger only once
        // code
    },
    holdEvent() { /* optional */
        // keybinding is pressed now! I will trigger every frame the key is pressed
        // code
    },
    name: 'My keybinding',
    description: 'Does something I guess.',
}
```

## `INPUT_FIELD`

![image](https://github.com/user-attachments/assets/e184bf00-7695-421f-be65-ddd795abccb3)

```javascript
// Without name
{
    type: 'INPUT_FIELD',
    name: '',
    init: 'initial text',
    changeEvent() { /* optional */
        // code
    }
},
```

// IMAGE HERE

```javascript
// With name
{
    type: 'INPUT_FIELD',
    name: 'favorite food',
    init: 'bricks',
    changeEvent() { /* optional */
        // code
    }
},
```

![image](https://github.com/user-attachments/assets/269bcf55-48eb-44c7-a133-02b290cdc84d)

```javascript
// Without name
{
    type: 'INPUT_FIELD',
    name: '',
    init: 'crossthecodes 123',
    changeEvent() { /* optional */
        // code
    },
    isValid(text) {
        return text.includes('crossthecodes')
    }
}
},
```

// IMAGE HERE

```javascript
// With name
{
    type: 'INPUT_FIELD',
    name: 'favorite plushie',
    init: 'lea',
    changeEvent() { /* optional */
        // code
    },
    isValid(text) {
        return text == 'lea'
    }
}
},
```


## `JSON_DATA`
```javascript
{
    type: 'JSON_DATA',
    init: 123,
    changeEvent() { /* optional */
        // code
    }
}
```

## Name padding

On any option with a name visible, you can set the `noNamePadding` field to `true` to disable the padding.  
For example:  

// IMAGE HERE

```javascript
{
    type: 'CHECKBOX',
    init: true,
    name: 'My checkbox',
    noNamePadding: true,
    description: "It's initialized as true by default.",
}
```

Here's the whole page with `noNamePadding` set to `true`:  

// IMAGE HERE


### Full example

![image](https://github.com/user-attachments/assets/075ed3bc-8fa8-4b0c-87f0-64ee025913d7)

```javascript
// for typescript:
// import type {} from 'ccmodmanager/types/plugin'

const Opts = modmanager.registerAndGetModOptions(
    {
        modId: 'my-mod', // the same as the `id` field in `ccmod.json`
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
                        // Creates a slider with the following text:
                        // 1   2   3   4   5   6   7   8
                        // that resolve to the following values:
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
                    myInputField: {
                        type: 'INPUT_FIELD',
                        name: '',
                        init: 'initial text',
                        changeEvent() {
                            /* optional */
                            // code
                        },
                    },
                    myValidatedInputField: {
                        type: 'INPUT_FIELD',
                        name: '',
                        init: 'crossthecodes 123',
                        changeEvent() {
                            /* optional */
                            // code
                        },
                        isValid(text) {
                            return text.includes('crossthecodes')
                        },
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
Opts.myInputField // string
Opts.myValidatedInputField // string

Opts.myNumberStorage // number
Opts.myJsonStorage.a // number
Opts.myJsonStorage.b // number
Opts.myJsonStorage.c // number
/* Invalid code: */
// Opts.myJsonStorage.a = 2 // The stored data is read-only, you need to override the whole object
/* This is how you do it: */
Opts.myJsonStorage = { ...Opts.myJsonStorage, a: 2 }
```

### Other examples
- (javascript) [cc-staircase-effect-fix](https://github.com/Unarelith/cc-staircase-effect-fix/blob/master/prestart.js) as an example of `INFO`, `CHECKBOX` and `OBJECT_SLIDER`
- (typescript) [cc-fancy-crash](https://github.com/krypciak/cc-fancy-crash/blob/main/src/options.ts) as an example of `BUTTON_GROUP` and `CHECKBOX`
- (typescript) [cc-record](https://github.com/krypciak/cc-record/blob/main/src/options.ts) as an example of `OBJECT_SLIDER` and `CONTROLS`
- (typescript) [CCModManager](https://github.com/CCDirectLink/CCModManager/blob/master/src/options.ts) as an example of `JSON_DATA`, `BUTTON` and `INPUT_FIELD`
- (typescript) [CrossedEyes](https://github.com/CCDirectLink/CrossedEyes/blob/master/src/options.ts) as an example of a big multi-tab menu with a custom language getter

#### Building CCModManager

```bash
git clone https://github.com/CCDirectLink/CCModManager
cd CCModManager
pnpm install
pnpm run start
# this should return no errors (hopefully)
npx tsc
```
