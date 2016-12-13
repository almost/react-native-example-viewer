import React from 'react';
import { ScrollView, View, Picker, Text, Navigator, TouchableOpacity, StyleSheet, Alert, AsyncStorage, StatusBar } from 'react-native';

class ShowExample extends React.Component {
  constructor () {
    super()
  }

  _getPresets() {
    let {presets} = this.props.story;
    return typeof presets === "function" ? presets() : presets;
  }

  componentWillMount() {
    const presets = this._getPresets();
    this.setState({currentPreset: 'default', storyState: presets.default, actionLog: []});
  }

  render () {
    const { story, embiggen } = this.props;
    const presets = this._getPresets();
    const makeAction = (type, extra) => (...args) => {
      this.setState(({storyState, actionLog}) => {
        let action = {type, args, ...extra};
        return {
          storyState: (story.reducer && story.reducer[type]) ? story.reducer[type](storyState, action) : storyState,
          actionLog: actionLog.concat([[(new Date()).toISOString(), action]]),
        };
      });
    };

    return (
        <View style={styles.container}>
          {(!embiggen) && (
              <Picker
               style={{minHeight: 100}}
               selectedValue={this.state.currentPreset}
               onValueChange={currentPreset => this.setState({currentPreset, storyState: presets[currentPreset] })}>
                 { Object.keys(presets).map(preset => {
                   return <Picker.Item key={preset} label={preset} value={preset}/>;
                 })}
              </Picker>
          )}
          {story.render(this.state.storyState, makeAction)}
          {(!embiggen) && (
              <ScrollView style={styles.actionLog}>
                { this.state.actionLog.map(([date, action] ,i) => (
                  <TouchableOpacity key={i} onPress={() => Alert.alert(action.type, JSON.stringify(action))}>
                    <Text><Text style={styles.actionLogTS}>{date}:</Text><Text> {action.type}</Text></Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
          )}
        </View>
    );
  }
}


class ExampleList extends React.Component {
  _renderScene (route, navigator) {
    if (route.story== null) {
      return (
        <ScrollView style={{flex: 1, paddingTop: 60}}>
          {this.props.examples.map((story,i) => (
            <TouchableOpacity key={i} onPress={() => navigator.push({name: story.title, story: story})} style={styles.exampleItem}>
              <Text>{story.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )
    } else {
      return <ShowExample story={route.story} embiggen={this.props.embiggen}/>
    }
  }

  render () {
    return (
      <Navigator
        initialRoute={{name: 'Examples', story: null}}
        renderScene={this._renderScene.bind(this)}
        navigationBar={(!this.props.embiggen) && <Navigator.NavigationBar routeMapper={{
          Title: route => <Text>{route.name}</Text>,
          LeftButton: (route, navigator) => (route.story) && <TouchableOpacity onPress={() => navigator.pop()}><Text style={styles.back}>Back</Text></TouchableOpacity>,
          RightButton: (route, navigator) => (route.story) && <TouchableOpacity onPress={this.props.onToggleEmbiggen}><Text style={styles.embiggen}>+</Text></TouchableOpacity>,
        }}/>}
      />
    );
  }
}


class ExampleViewer extends React.Component {
  constructor () {
    super();
    this.state = {showApp: false, embiggen: false};
  }

  render () {
    if (this.state.showApp) {
      return <this.props.appComponent/>;
    }

    const examples = this.props.modules.map(x => x.__examples__).filter(x => x);

    return (
      <View style={styles.container}>
        <StatusBar hidden={true}/>
        <TouchableOpacity onPress={() => this.state.embiggen ? this.setState({embiggen: false}) : this.setState({showApp: true})} style={styles.statusBar}>
          <Text style={styles.statusBarText}>{this.state.embiggen ? 'Back' : 'Open App' }</Text>
        </TouchableOpacity>
        <ExampleList examples={examples} style={styles.container} embiggen={this.state.embiggen} onToggleEmbiggen={() => this.setState({embiggen: !this.state.embiggen})}/>
      </View>
    );
  }
}

// registerComponent needs a component and doesn't allow passing in props so we
// supply a function here to create a component with the props already set.
function makeExampleViewer(modules, appComponent) {
  class ExampleViewerWrapper extends React.Component {
    render () {
      return <ExampleViewer modules={modules} appComponent={appComponent}/>;
    }
  };
  return ExampleViewerWrapper;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: 20,
    backgroundColor: 'yellow',
  },
  statusBarText: {
    textAlign: 'center',
  },
  actionLog: {
    backgroundColor: 'grey',
    flex: 0.5,
  },
  actionLogLine: {
    flex: 1,
    flexDirection: 'column',
  },
  actionLogTS: {
    fontWeight: 'bold',
  },
  exampleItem: {
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  back: {
    paddingLeft: 10,
  },
  embiggen: {
    paddingRight: 10,
  },
});


module.exports = makeExampleViewer;
