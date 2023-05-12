const FILE = 'heftlog.json';
const S = require('Storage');

// Load profile if it exists or assign default values
var Profile = Object.assign({
    height:null,
    log:null
  }, S.readJSON(FILE, true) || {});

// Menu to allow users to set their own height
var HeightMenu = {
  '' : {
    back : () => { E.showMenu(MainMenu); },
  },  
  value: Profile.height ? Profile.height : 168,
  min: 55, // Chandra Bahadur Dangi
  max: 272, // Robert Wadlow
  step: 1,
  onchange: (h) => { saveFile(Profile, 'height', h, FILE); }
};

// Main menu
var MainMenu = {
  '' : {
    title : 'Heft Log',
    back : () => { Bangle.showClock(); },
  },
  'Log weight' : {
    '' : {
      back : () => { E.showMenu(MainMenu); },
    },
    value: Profile.log == undefined ? 65.6 : Profile.log[0].heft,
    min: 2.1, // Lucía Zárate
    max: 635.0, // Jon Browner Minnoch
    step: 0.1,
    onchange: (weight) => { logWeight(weight, Profile, FILE); }
  },
  'Load Graph' : () => { loadGraph(); },
  'Show Log' : () => { showLog(); },
  'Change height' : HeightMenu,
  'Exit': Bangle.showClock()
};


// Simplify file saving process
function saveFile(object, key, value, file){
  object[key] = value;
  S.writeJSON(file, object);
}

// TODO
function logWeight(w, record, f){
  function _addzero_(x){
    return (x < 10 ? '0' + x.toString() : x.toString());
  }

  let d = Date().getDate(),
      m = Date().getMonth() + 1,
      y = Date().getFullYear();

  let entry = {
  	date : y.toString() + _addzero_(m) + _addzero_(d),
  	heft : w
  };

  let prompt;
  let index = record.log.findIndex(li => li.date === entry.date);

  if (index >=0 ){
    record.log[index].heft = entry.heft;
    prompt = 'Overwrite weight record?';
  } else if (entry.date > record.log[0].date){
    record.log.unshift(entry);
    prompt = 'File a new weight record?';
  } else return;

  if (E.showPrompt(prompt)){
    S.writeJSON(f, record);
  } else return;
}

// TODO
function loadGraph(){
  Bangle.showClock();
}

// TODO
function showLog(){
  Bangle.showClock();
}

///////////////////////////// CODE START //////////////////////////////
Bangle.loadWidgets();

if (Profile.height != null) {
  E.showMenu(MainMenu);
} else {
  E.showMenu({
    '' : {
      title : 'Set your height in cm:',
      back : () => { Bangle.showClock(); },
    },
    'Change height' : HeightMenu,
  });
  console.log(Profile.height);
}
