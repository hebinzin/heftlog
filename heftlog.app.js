Bangle.loadWidgets();
const S = require('Storage');

// Simplify file saving process
function saveFile(object, key, value, file){
  object[key] = value;
  S.writeJSON(file, object);
}

// Load data from json file if it exists, or assign default values
var profile = Object.assign({
  height:null,
  log:null
}, S.readJSON('heftlog.json', true) || {});

// Menu to allow users to set their own height
var heightMenu = {
  '' : {
    back : () => { E.showMenu(mainMenu); },
  },
  value: profile.height ? profile.height : 168,
  min: 55, // Chandra Bahadur Dangi
  max: 272, // Robert Wadlow
  step: 1,
  onchange: (h) => { saveFile(profile, 'height', h, 'heftlog.json'); }
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
    value: profile.log == undefined ? 65.6 : profile.log[0].heft,
    min: 2.1, // Lucía Zárate
    max: 635.0, // Jon Browner Minnoch
    step: 0.1,
    onchange: (w) => {
      profile.log.unshift(logWeight(w));
      saveFile(profile, 'log', profile.log, 'heftlog.json');
    }
  },
  'Load Graph' : () => { loadGraph(); },
  'Show Log' : () => { showLog(); },
  'Change height' : heightMenu,
  'Exit': Bangle.showClock()
};

// TODO
function logWeight(w){
  let d = Date().getDate(), m = Date().getMonth() + 1, y = Date().getFullYear();
  function addzero(x){
    return (x < 10 ? '0' + x.toString() : x.toString());
  }
  return {
  	date : y.toString() + addzero(m) + addzero(d),
  	heft : w
  };
}

// TODO
function loadGraph(){
  Bangle.showClock();
}

// TODO
function showLog(){
  Bangle.showClock();
}

if (profile.height != null) {
  E.showMenu(mainMenu);
} else {
  E.showMenu({
    '' : {
      title : 'Set your height in cm:',
      back : () => { Bangle.showClock(); },
    },
    'Change height' : heightMenu,
  });
  console.log(profile.height);
}
