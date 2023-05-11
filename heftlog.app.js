Bangle.loadWidgets();
const S = require('Storage');

// Simplify file saving process
function saveFile(object, key, value, file){
  object[key] = value;
  S.writeJSON(file, object);
}

// Load data from json file if it exists, or assign default values
var data = Object.assign({
  height:null,
  log:null
}, S.readJSON('heftlog.json', true) || {});


// Menu to allow users to set their own height
var heightMenu = {
  '' : {
    back : () => { E.showMenu(mainMenu); },
  },
  value: data.height ? data.height : 168,
  min: 55, // Chandra Bahadur Dangi
  max: 272, // Robert Wadlow
  step: 1,
  onchange: (val) => { saveFile(data, 'height', val, 'heftlog.json'); }
};

// Main menu
var mainMenu = {
  '' : { 
    title : 'Heft Log',
    back : () => { Bangle.showClock(); },
  },
  'Log weight' : {
    '' : {
      back : () => { E.showMenu(mainMenu); },
    },
    value: data.log[0].weight ? data.log[0].weight : 65.5,
    min: 2.1, // Lucía Zárate
    max: 635.0, // Jon Browner Minnoch
    step: 0.1,
    //onchange:  => logWeight('weight', w)
  },
  'Load Graph' : () => { loadGraph(); },
  'Show Log' : () => { showLog(); },
  'Change height' : heightMenu,
  'Exit': Bangle.showClock()
};

// TODO
function logWeight(a, b){
  console.log(a);
  console.log(b);
  Bangle.showClock();
}

// TODO
function loadGraph(){
  Bangle.showClock();
}

// TODO
function showLog(){
  Bangle.showClock();
}

if (data.height != null) {
  E.showMenu(mainMenu);
} else {
  E.showMenu({
    '' : { 
      title : 'Set your height in cm:',
      back : () => { Bangle.showClock(); },
    },
    'Change height' : heightMenu,
  });
  console.log(data.height);
}