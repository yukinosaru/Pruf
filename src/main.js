// React imports - Material UI //
import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Route,
  Link,
  Switch
} from 'react-router-dom';
//import * as firebase from 'firebase';
import SwipeableViews from 'react-swipeable-views';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {blue500,indigo500,green500,blue50,grey500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import 'babel-polyfill';
import AppBar from 'material-ui/Appbar';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';

import localforage from 'localforage';

var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');

(function() {
  'use strict';
// *** START SERVICE WORKER CODE *** //
// Check to make sure service workers are supported in the current browser,
// and that the current page is accessed from a secure origin. Using a
// service worker from an insecure origin will trigger JS console errors. See
// http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

if ('serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost)) {
  navigator.serviceWorker.register('service-worker.js')
  .then(function(registration) {
    // updatefound is fired if service-worker.js changes.
    registration.onupdatefound = function() {
      // updatefound is also fired the very first time the SW is installed,
      // and there's no need to prompt for a reload at that point.
      // So check here to see if the page is already controlled,
      // i.e. whether there's an existing service worker.
      if (navigator.serviceWorker.controller) {
        // The updatefound event implies that registration.installing is set:
        // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
        var installingWorker = registration.installing;

        installingWorker.onstatechange = function() {
          switch (installingWorker.state) {
            case 'installed':
              // At this point, the old content will have been purged and the
              // fresh content will have been added to the cache.
              // It's the perfect time to display a "New content is
              // available; please refresh." message in the page's interface.
              break;

            case 'redundant':
              throw new Error('The installing ' +
                              'service worker became redundant.');

            default:
              // Ignore
          }
        };
      }
    };
  }).catch(function(e) {
    console.error('Error during service worker registration:', e);
  });
}

// Need to add caching for dynamic requests - and an HTTP fetch interceptor...
// Probably use IndexDB
// *** END SERVICE WORKER CODE *** //

// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyDqH4jC3PvzDfSgzAdXUh6ZuOSLI2CBtpk",
  authDomain: "getpruf.firebaseapp.com",
  databaseURL: "https://getpruf.firebaseio.com",
  projectId: "getpruf",
  storageBucket: "",
  messagingSenderId: "1076611818114"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var auth = firebase.auth();

// Initialise localforace
var localforageConfig = {
  driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name        : 'Prüf',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'recipedata', // Should be alphanumeric, with underscores.
  description : 'Bread Recipes'
}
localforage.config(localforageConfig);

// REACT components
// Hero image
// Target weight
// Spinner
// FAB
// Card

class StartFAB extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    const style = {
      margin: 0,
      top: 'auto',
      left: 'auto',
      bottom: 32,
      right: 20,
      position: 'fixed'
    }
    return(
      <FloatingActionButton style={style} onClick={this.props.onClick}>
        <FontIcon className="material-icons">arrow_forward</FontIcon>  
      </FloatingActionButton>
    );
  }
}
class IngredientsCard extends React.Component{
  constructor(props){
    super(props);
    this.toTitleCase = this.toTitleCase.bind(this);
  }
  toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
  render(){
    const styles = {
      cardStyle: {
        margin: 8
      }
    }
    var ingredients = this.props.ingredients;
    var listItems = [];
    Object.keys(ingredients).forEach((key)=> listItems.push(<ListItem key={key} primaryText={this.toTitleCase(key) + ": " + ingredients[key].toFixed(1) + this.props.units} />));

    return (
      <Card style={styles.cardStyle}>
        <CardText>
          <h3>Here's what you'll need:</h3>
          <List>
            {listItems}
          </List>
        </CardText>
      </Card>
    );
  }
}

class WeightSelector extends React.Component {
  constructor(props){
    super(props);
  }
  render(){
    const styles = {
      cardStyle: {
        margin: 8
      },
    };  
    return(
      <Card style={styles.cardStyle}>
      <CardTitle subtitle={this.props.description} />
      <CardText>
        <TextField
          id="doughWeight"
          hintText="How much dough do you want?"
          floatingLabelText="Dough weight"
          type="number"
          value={this.props.value}
          onChange={this.props.onChange}
        /> {this.props.units}
      </CardText>
    </Card>
    );
  }
}

class HeroImage extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const styles = {
      selectHintStyle: {
        paddingLeft: 24,
        color: grey500
      },
      selectLabelStyle: {
        paddingLeft: 18,
        color: 'white',
        fontSize: '1.2em',
      },
      selectUnderlineStyle: {
        display: 'none'
      }
    };

    var selectHint = "Choose a bread";

    return(
      <Card>
        <CardMedia
          overlay={<SelectField
            floatingLabelText={selectHint}
            floatingLabelStyle={styles.selectHintStyle}
            labelStyle={styles.selectLabelStyle}
            underlineDisabledStyle={styles.selectUnderlineStyle}
            underlineFocusStyle={styles.selectUnderlineStyle}
            underlineStyle={styles.selectUnderlineStyle}
            children={this.props.menuItems}
            value={this.props.value}
            onChange={this.props.onChange} />}
        >
          <img src={this.props.imageURL} alt="Bake Better Bread" />
        </CardMedia>
      </Card>
    );
  }
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      units: 'g',
      doughWeight: '',
      bread: '',
      recipes: '',
      ingredients: [],
      imageFilename: '',
      showIngredients: false
    };
    this.menuItems = [];
    this.handleWeightChange = this.handleWeightChange.bind(this);
    this.handleBreadChange = this.handleBreadChange.bind(this);
    this.setRecipes = this.setRecipes.bind(this);
    this.calculateIngredients = this.calculateIngredients.bind(this);
    this.handleFABClick = this.handleFABClick.bind(this);
  }

  componentWillMount(){
    // Checks for existence of local data cache
    localforage.getItem('recipes').then((value)=>{
      if(value==null){
        // First load, so fetches firebase data and caches bread names
        console.log("[Prüf] Caching recipe data");
        auth.signInAnonymously().then(() => {
          var ref = firebase.database().ref('recipes');
          ref.once('value').then((snapshot) => {
            var firebaseData = snapshot.val();
            localforage.setItem('recipes',firebaseData).then(()=> this.setRecipes(firebaseData))
          })
        });
      } else {
        // Quickly display cached data
        this.setRecipes(value);
        
        // Update cache from firebase and update state
        console.log("[Prüf] Updating cached data");
        auth.signInAnonymously().then(() => {
          var ref = firebase.database().ref('recipes');
          ref.once('value').then((snapshot) => {
            var firebaseData = snapshot.val();
            localforage.setItem('recipes',firebaseData).then(()=> this.setRecipes(firebaseData));
            console.log("[Prüf] Cached data updated");
          })
        });
      }
    }).catch(function(err){
      // Error handling
      console.log(err);
    });
  }

  setRecipes(recipes){
    this.menuItems = [];
    Object.keys(recipes).forEach((key)=> this.menuItems.push(<MenuItem key={key} value={key} primaryText={recipes[key].name} />));
    var bread = Object.keys(recipes);
    this.setState ({recipes: recipes});
  }
  handleWeightChange(event,value){
    this.setState({doughWeight: value});
    if(this.state.bread){this.calculateIngredients(this.state.bread,value);}
  }
  handleBreadChange(event,index,value){
    this.setState({
      bread: value,
      imageFilename : this.state.recipes[value].imageURL
    });
    if(this.state.doughWeight){this.calculateIngredients(value,this.state.doughWeight);}
  }
  calculateIngredients(bread,weight){
    console.log("[Prüf] Calculating ingredients");

    // Use ingredients array to calculate actual values (not proportions)
    var ingredients = this.state.recipes[bread].ingredients;
    // Logic: Calculate totalproportion by adding ingredient proportions to 100 (flour)
    var totalProportion = 100;
    Object.keys(ingredients).forEach((key) => totalProportion += parseFloat(ingredients[key]));

    // Calculate flour weight
    var flourWeight = parseFloat(weight) * 100 / totalProportion;

    // Multiply relative unit by each ingredient proportion
    var absIngredients = {};
    absIngredients["Flour"] = flourWeight;
    Object.keys(ingredients).forEach((key) => absIngredients[key] = (ingredients[key]/100) * flourWeight);
    this.setState({ingredients: absIngredients, showIngredients: true});
  }
  handleFABClick(event,value){
    console.log("FABulous");
  }

  render(){
    const styles = {
      cardStyle: {
        margin: 8
      }
    };

    if(!this.state.recipes){
      var description = "Fetching recipes...";
    } else if(!this.state.bread){
      var description = "Ready? Pick a bread from the list above!";
    } else {
      var description = this.state.recipes[this.state.bread].description;
    }

    if(this.state.imageFilename=='' || this.state.imageFilename==undefined){
      var imageURL = "images/drawable-mdpi/sliced_loaf.png"
    } else {
      var imageURL = "images/drawable-mdpi/" + this.state.imageFilename;
    }
    return (
      <div>
        <AppBar title="Prüf" showMenuIconButton={false} zDepth={3} />
        <HeroImage menuItems={this.menuItems} value={this.state.bread} onChange={this.handleBreadChange} imageURL={imageURL} />
        <WeightSelector
          description={description}
          value={this.state.doughWeight} 
          onChange={this.handleWeightChange}
          units={this.state.units} />
        <StartFAB onClick={this.handleFABClick} />
        {this.state.showIngredients ? <IngredientsCard ingredients={this.state.ingredients} units={this.state.units} /> : "" }
      </div>
      );
  }
}


// STARTUP CODE
// Sets theme colors
const muiTheme = getMuiTheme({
  palette: {
    primary1Color: blue500,
    primary2Color: indigo500,
    accent1Color: green500,
    pickerHeaderColor: blue50,
  }
});

ReactDOM.render(
  <MuiThemeProvider muiTheme={muiTheme}>
    <BrowserRouter>
      <Route component={App}/>
    </BrowserRouter>
  </MuiThemeProvider>,
  document.getElementById('mainContent')
);

})();