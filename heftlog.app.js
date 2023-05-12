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
  onchange: h => { 
    //saveFile(Profile, 'height', h, FILE);
    Profile.height = h;
    S.writeJSON(FILE, Profile);
  }
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
    onchange: weight => { logWeight(weight, Profile, FILE); }
  },
  'Load Graph' : () => { loadGraph(); },
  'Show Log' : () => { showLog(Profile.log); },
  'Change height' : HeightMenu,
  'Exit': Bangle.showClock()
};

// Enter 'W'eight and current date in the 't'ally and save it to 'F'ile
function logWeight(W, t, F){
  let d = Date().getDate(),
  m = Date().getMonth() + 1,
  y = Date().getFullYear();

  function _addzero_(x){
    return (x < 10 ? '0' + x.toString() : x.toString());
  }

  let entry = {
  	date : Number(y.toString() + _addzero_(m) + _addzero_(d)),
  	heft : W
  };

  if (t.log == null || t.log.length < 1){
    t.log = [entry];
  } else {
    let index = t.log.findIndex(r => r.date === entry.date);
    if (index >=0 ){
      t.log[index].heft = entry.heft;
    } else if (entry.date > t.log[0].date){
      t.log.unshift(entry);
    } else return false;
  }

  //TODO: Prompt the user to confirm in case of overwritting
  S.writeJSON(F, t);
  return true;
}

// TODO
function loadGraph(){
  Bangle.showClock();
}

// TODO
function showLog(L){

  function _formatDt_(dt){
    dt = dt.toString();
    return dt.slice(2,4) + "-" + dt.slice(4,6) + "-" + dt.slice(6,8);
  }

  let s = {
    h: 22,
    c: L.length,
    draw: (i, r) => {
      g.clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
      g.setFont('4x6', 3);
      g.drawString(
        _formatDt_(L[i].date) + '  ' + L[i].heft
        , r.x
        , r.y+6
      );
    },
    back: () => { E.showScroller(); E.showMenu(MainMenu); }
  };
  E.showScroller(s);
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
