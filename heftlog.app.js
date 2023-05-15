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
  'Show Log' : () => { showLog(Profile.log); },
  'Load Graph' : () => { loadGraph(Profile.log, Profile.height); },
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

function formatDt(dt, separator){
  dt = dt.toString();
  return dt.slice(2,4) + separator + dt.slice(4,6) + separator + dt.slice(6,8);
}

// Takes the heft log and show it as a scrollable list
function showLog(L){
  E.showMenu();

  let list = {
    h: 30,
    c: L.length,
    draw: (i, r) => { // 'i'ndex and 'r'ectangular list item area
      g.clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1).setFont('12x20')
       .setFontAlign(-1).drawString(formatDt(L[i].date, '-'), r.x+6, r.y+10)
       .setFontAlign(1).drawString(L[i].heft.toFixed(1), r.w-6, r.y+10);
    },
    back: () => { E.showScroller().showMenu(MainMenu); },
    select : i => { return;}
  };
  E.showScroller(list);
}

function loadGraph(L, height){
  E.showMenu();

  // The app usage timespan (interval from first to last timestamp)
  let span = L[0].ts - L[L.length-1].ts;
  // To store the topmost and b
  let bottom = L[0].heft, top = bottom;

  for (i = 0; i < L.length; i++){
    // Each entry also gets its span calculated
    // which is then divided by the total span.
    // This gives us the coordinate as a percentage value
    L[i].x = ((L[i].ts - L[L.length-1].ts) / span).toFixed(3);

    // Check wether the current heft is the highest or lowest
    if (L[i].heft > top){
      top = L[i].heft;
    } else if (L[i].heft < bottom){
      bottom = L[i].heft;
    }
  }

  // We'll use the same iteration to get the lowest and highest heft
  let variance = top - bottom; // How much the user's weight changed

  // Calculate the 'y' coordinates (weight) for each log entry:
  for (j = 0; j < L.length; j++){
    L[j].y = (1 -((L[j].heft - bottom) / variance)).toFixed(3);
  }

  const R = Bangle.appRect; // Screen portion available to the app
  const graphHeight = R.h * 0.75; // ¼ height is reserved for the gap
  const gap = (R.h - graphHeight) / 2; // The gap for displaying info
  const offset = g.getHeight() - R.h; // The space used by the widgets

  for (k = L.length - 2; k >= 0; k--){

    let imc = L[k].heft / Math.pow(height / 100, 2);
    if (imc > 30 || imc < 17) g.setColor(1, 0, 0);
    else if (imc > 25 || imc < 18.5) g.setColor(1, 1, 0);
    else if (imc > 21 && imc < 23) g.setColor(0, 1, 0);
    else g.setColor(1, 1, 1);

    g.drawLine(
      L[k+1].x * R.w,
      L[k+1].y * graphHeight + offset + gap,
      L[k].x * R.w,
      L[k].y * graphHeight + offset + gap
    );
    g.drawCircle(L[k].x * R.w, L[k].y * graphHeight + offset + gap, 1);
    g.reset();
  }

  g // Writes top and bottom weight and last and first entry date:
   .setFont('4x6', 2).setFontAlign(0, 0)
   .drawString(top, R.w / 2, gap / 2 + offset)
   .drawString(bottom, R.w / 2, R.h - (gap / 2) + offset)
   .setFont('6x8').setFontAlign(0, 0, 90)
   .drawString(formatDt(L[0].date, '/'), 4, R.h / 2  + offset)
   .drawString(formatDt(L[L.length-1].date, '/'), R.w - 4, R.h / 2 + offset);

  setWatch(
    () => { 
      if (Bangle.isLocked() == false){
        g.clear();
        E.showMenu(MainMenu);
      }
    },
    BTN1,
    {
      repeat: false,
      edge: 'falling'
    }
  );
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