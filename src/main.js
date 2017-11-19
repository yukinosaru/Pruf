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
import * as firebase from 'firebase';
import {FirebaseAuth} from 'react-firebaseui';

import SwipeableViews from 'react-swipeable-views';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {blue500,indigo500,green500,blue50,grey500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import 'babel-polyfill';
import AppBar from 'material-ui/Appbar';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';

import localforage from 'localforage';
// var firebase = require('firebase');
var firebaseui = require('firebaseui');

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
  apiKey: "AIzaSyCtJJfsVxW0QkLBU3JW03qbLL7Gd80ossg",
  authDomain: "breadsheet-eaa71.firebaseapp.com",
  databaseURL: "https://breadsheet-eaa71.firebaseio.com",
  projectId: "breadsheet-eaa71",
  storageBucket: "breadsheet-eaa71.appspot.com",
  messagingSenderId: "703120037645"
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

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      units: 'g',
      doughWeight: '',
      bread: '',
      recipes: '',
      ingredients: []
    };
    this.menuItems = [];
    this.handleWeightChange = this.handleWeightChange.bind(this);
    this.handleBreadChange = this.handleBreadChange.bind(this);
    this.setRecipes = this.setRecipes.bind(this);
    this.calculateIngredients = this.calculateIngredients.bind(this);
    this.toTitleCase = this.toTitleCase.bind(this);

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
    this.setState ({recipes: recipes, bread: bread[0]});
    console.log("[Prüf] Menu Items " + bread[0]);
  }
  
  handleWeightChange(event,value){
    this.setState({doughWeight: value});
    this.calculateIngredients(this.state.bread,value);
  }

  handleBreadChange(event,index,value){
    this.setState({bread: value});
    this.calculateIngredients(value,this.state.doughWeight);
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

    console.log("[Prüf] Target weight: " + weight + " | Total Proportion: " + totalProportion + " | Flour Weight " + flourWeight);
    // Multiply relative unit by each ingredient proportion
    var absIngredients = {};
    absIngredients["Flour"] = flourWeight;
    Object.keys(ingredients).forEach((key) => absIngredients[key] = (ingredients[key]/100) * flourWeight);
    this.setState({ingredients: absIngredients});
  }

  toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  render(){
    const styles = {
      cardStyle: {
        margin: 8
      },
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
      },
      FABStyle: {
        margin: 0,
        top: 'auto',
        left: 'auto',
        bottom: 32,
        right: 20,
        position: 'fixed',
      }
    };

    if(!this.state.recipes){
      var description = "Fetching recipes...";
      var content = "";
    } else {
      var description = this.state.recipes[this.state.bread].description;
      if(this.state.doughWeight == ""){
        var content = "";
      } else {
        var ingredients = this.state.ingredients;
        var objContent = [];
        Object.keys(ingredients).forEach((key)=> objContent.push(<ListItem key={key} primaryText={this.toTitleCase(key) + ": " + ingredients[key].toFixed(1) + this.state.units} />));
        var content = (
          <Card style={styles.cardStyle}>
            <CardTitle subtitle="Here's what you need" />
            <CardText>
              <List>
                {objContent}
              </List>
            </CardText>
          </Card>
        );
      }
    }
    var selectHint = "Choose a bread";

    return (
      <div>
        <AppBar title="Prüf" showMenuIconButton={false} />
        <Card>
          <CardMedia
            overlay={<SelectField floatingLabelText={selectHint} floatingLabelStyle={styles.selectHintStyle} labelStyle={styles.selectLabelStyle} underlineDisabledStyle={styles.selectUnderlineStyle} underlineFocusStyle={styles.selectUnderlineStyle} underlineStyle={styles.selectUnderlineStyle} children={this.menuItems} value={this.state.bread} onChange={this.handleBreadChange} />}
          >
            <img src="images/drawable-xhdpi/baguette.jpg" alt="Bake Better Bread" />
          </CardMedia>
        </Card>
        <Card style={styles.cardStyle}>
          <CardTitle subtitle={description} />
          <CardText>
            <TextField
              id="doughWeight"
              hintText="How much dough do you want?"
              type="number"
              value={this.state.doughWeight}
              onChange={this.handleWeightChange}
            /> {this.state.units}
          </CardText>
        </Card>
        <FloatingActionButton style={styles.FABStyle}>
          <FontIcon className="material-icons" style={styles.icon}>arrow_forward</FontIcon>  
        </FloatingActionButton>
        {content}
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