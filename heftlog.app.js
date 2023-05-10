const S = require('Storage');

// Simplify file saving process
function saveFile(object, key, value, file)
{
  object[key] = value;
  S.writeJSON(file, object);
}

/*
 * VARIABLES:
 */

// Load data from `heftlog.json` if it exists
let data = Object.assign({
  // Default values
  height:null,
  log:null
}, S.readJSON('heftlog.json', true) || {});


// Menu to allow the user to set his own height
var heightMenu = {
  '' : {
    title : 'Change Height'
  },
  '< Back' : () => { E.showMenu(mainMenu); },
  'Height (cm)' : {
  	value: data.height,
  	min: 55, // Chandra Bahadur Dangi
  	max: 272, // Robert Wadlow
  	step: 1,
  	onchange: h => {
  	  saveFile('heftlog.json', h);
  	  E.showMenu(mainMenu);
  	}
  }
};


if (data.height == null) {
	E.showMenu(heightMenu);
}


// TODO
function loadGraph() {
  E.showMenu();
}
// TODO
function logWeight() {
  E.showMenu();
}

// Main menu
var mainMenu = {
  '' : { 
    title : 'Heft Log'
  },
  '< Back' : () => { E.showMenu(); },
  'Load Graph' : loadGraph(),
  'Log weight (kg)' : {
    value: data.log[0].weight,
    min: 2.1, // Lucía Zárate
    max: 635.0, // Jon Browner Minnoch
    step: 0.1,
    onchange: w => logWeight('weight', w)
  },
  'Change height' : E.showMenu(heightMenu),
  'Exit': () => { E.showMenu(); }
};
