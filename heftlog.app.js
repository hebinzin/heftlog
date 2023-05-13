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
  'Load Graph' : () => { loadGraph(Profile.log); },
  'Show Log' : () => { showLog(Profile.log); },
  'Change height' : HeightMenu,
  'Exit': Bangle.showClock()
};

// Enter current date and 'W'eight in the 't'ally and save it to 'F'ile
function logWeight(W, t, F){
  let d = Date().getDate(),
  m = Date().getMonth() + 1,
  y = Date().getFullYear();

  function _addzero_(x){
    return (x < 10 ? '0' + x.toString() : x.toString());
  }

  let entry = {
    date : Number(y.toString() + _addzero_(m) + _addzero_(d)),
    timestamp : Math.round(Date.now() / 1000),
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
function loadGraph(L){
  E.showMenu();

  // Calculate 'x' coordinates (time) for each log entry:
  // First we get the span between the log's last and first timestamp
  let span = L[0].timestamp - L[L.length-1].timestamp;
  // We'll use the same iteration to get the lowest and highest heft
  let bottom = L[0].heft, top = bottom;

  for (i = 0; i < L.length; i++){

    // Each entry also gets its span calculated
    // which is then divided by the total span.
    // This gives us the coordinate as a percentage value
    L[i].x = ((L[i].timestamp - L[L.length-1].timestamp) / span).toFixed(3);

    // Check wether the current heft is the highest or lowest
    if (L[i].heft > top){
      top = L[i].heft;
    } else if (L[i].heft < bottom){
      bottom = L[i].heft;
    }
  }

  // How much the user's weight has changed
  let variance = top - bottom;

  // Calculate the 'y' coordinates (weight) for each log entry:
  for (j = 0; j < L.length; j++){
    L[j].y = (1 -((L[j].heft - bottom) / variance)).toFixed(3);
  }
  
  console.log(L);

  const R = Bangle.appRect;
  for (k = L.length - 2; k >= 0; k--){
    g.drawLine(
      L[k+1].x * R.w,
      L[k+1].y * R.h + 24,
      L[k].x * R.w,
      L[k].y * R.h + 24
    );
  }

  setWatch(() => {
    if (Bangle.isLocked() == false){
      g.clear();
      E.showMenu(MainMenu);
    }
  }, BTN1);
}

// Presents the user with a scrollable heft log
function showLog(L){
  E.showMenu();
  function _formatDt_(dt){
    dt = dt.toString();
    return dt.slice(2,4) + "-" + dt.slice(4,6) + "-" + dt.slice(6,8);
  }

  let s = {
    h: 30,
    c: L.length,
    draw: (i, r) => {
      g.clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
      g.setFont('12x20');
      let spacer;
      if (L[i].heft > 99.9) spacer = '     ';
      else spacer = '      ';
      g.drawString(
        _formatDt_(L[i].date) + spacer + L[i].heft,
        r.x+10,
        r.y+10
      );
    },
    back: () => { E.showScroller(); E.showMenu(MainMenu); },
    select : i => { return;}
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
