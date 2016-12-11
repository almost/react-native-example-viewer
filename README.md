# react-native-example-viewer

Include examples for your app's components in the same files as the components
and make them viewable in isolation.

THIS IS NOT PROPERLY DOCUMENTED YET, IT'S REALLY NOT READY FOR ANYONE ELSE TO
USE. 

Very similar to [React Native
Storybook](https://github.com/storybooks/react-native-storybook), the way you
define examples/stories is a bit different and this runs entirely within the
simulator/device instead of having the list of components as a seperate web
thing. React Native Storybook is way more polishd and you should almost certainly
use that instead of this.

Written by Thomas Parslow
([almostobsolete.net](http://almostobsolete.net) and
[tomparslow.co.uk](http://tomparslow.co.uk)) as part of Active Inbox
([activeinboxhq.com](http://activeinboxhq.com/)).

## Installation

```
npm install --save react-native-example-viewer
```

## Usage

In your startup file (probably named `index.ios.js`/`index.android.js`) replace
the AppRegister line with:

```
const EXAMPLE_VIEWER = __DEV__;

if (EXAMPLE_VIEWER) {
  const makeExampleViewer = require('react-native-example-viewer');
  const modules = [
    require('./js/components/MyButton'),
    require('./js/components/AnotherComponent'),
  ];

  AppRegistry.registerComponent('appname', () => makeExampleViewer(modules, MakeApp));
} else {
  AppRegistry.registerComponent('appname', () => MyApp);
}
```

Then at the bottom of each component file:

```
....component definition stuff...

export const __examples__ = {
  title: 'MyButton',
  presets: {
    'default': {label: 'hello'},
    'short label': {label: '1'},
    'long label': {label: 'What happens when we have a really long label'},
  },
  reducer: {
    // When we get the "pressed" action we change the label to "Pressed!"
    pressed: (state:any, action:any) => ({label: 'Pressed!'})
  },
  render (state:any, makeAction:any) {
    return <ActionButton label={state.label} onPress={makeAction('pressed')}/>;
  }
}
```

The presets list should at a minimum contain a `default` entry, they define
preset states which can be switched between by the viewer.

To test more dynamic stuff you can supply reducers for each named action. You
can create action functions to pass into your component by calling the
`makeAction` function passed into the render function.