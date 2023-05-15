const FILE = 'heftlog.json';
const S = require('Storage');

// Load the profile if it exists or assign default values
var Profile = Object.assign({
    height:null,
    log:null
  }, S.readJSON(FILE, true) || {});

var HeightMenu = {
  '' : {
    back : () => start(),
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
    onchange: weight => logWeight(weight, Profile)
  },
  'Show log' : () => showLog(Profile.log),
  'Load graph' : () => loadGraph(Profile.log, Profile.height),
  'Change height' : HeightMenu,
  'Exit': () => Bangle.showClock()
};

// Creates and saves a log entry with Weight and date
function logWeight(W, profile){
  let d = Date().getDate(),
  m = Date().getMonth() + 1,
  y = Date().getFullYear();

  function _addzero(x){
    return (x < 10 ? '0' + x.toString() : x.toString());
  }

  // An entry has a 'YYYYMMDD' date and the seconds since 1970
  let entry = {
    date : Number(y.toString() + _addzero(m) + _addzero(d)),
    timestamp : Math.round(Date.now() / 1000),
  	heft : W
  };

  if (profile.log == null || profile.log.length < 1){
    // If there's no log yet, create one with the current entry
    profile.log = [entry];
  } else {
    let index = profile.log.findIndex(r => r.date === entry.date);
    if (index >=0 ){
      // Overwrite an existing entry in the same day
      profile.log[index].heft = entry.heft;
    } else if (entry.date > profile.log[0].date){
      // A new day entry is placed in the top of the log
      profile.log.unshift(entry);
    } else return false;
  }

  //TODO: Prompt the user to confirm in case of overwritting
  S.writeJSON(FILE, t);
  return true;
}

// Turns the date into a string for displaying
function formatDt(dt, separator){
  dt = dt.toString();
  return dt.slice(2,4) + separator + dt.slice(4,6) + separator + dt.slice(6,8);
}

// Takes the Log and displays it as a scrollable list
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
    back: () => start(),
    select : i => { return; }
  };
  E.showScroller(list);
}

// A graphic view for the Log
function loadGraph(L, height){
  E.showMenu();

  // Calculate the interval between the first and the last entry
  let span = L[0].ts - L[L.length-1].ts;
  
  // Placeholders for the minimum and maximum weight values
  let bottom = L[0].heft, top = bottom;

  for (i = 0; i < L.length; i++){
    // Check if the current weight is the highest or the lowest
    if (L[i].heft > top){
      top = L[i].heft;
    } else if (L[i].heft < bottom){
      bottom = L[i].heft;
    }
    // Calculate and divide each entry's "span" by the total span
    // The result is the horizontal coordinate as a screen percentage
    L[i].x = ((L[i].ts - L[L.length-1].ts) / span).toFixed(3);
  }

  let variance = top - bottom; // How much the user weight has changed

  for (j = 0; j < L.length; j++){
    // Calculate the vertical coordinate as a screen percentage
    L[j].y = (1 -((L[j].heft - bottom) / variance)).toFixed(3);
  }

  const R = Bangle.appRect; // Screen portion available to the app
  const graphHeight = R.h * 0.75; // ¼ height is reserved for the gap
  const gap = (R.h - graphHeight) / 2; // The gap for displaying info
  const offset = g.getHeight() - R.h; // The space used by the widgets

  for (k = L.length - 2; k >= 0; k--){
    // Color coding the the graph line with user's BMI range
    let bmi = L[k].heft / Math.pow(height / 100, 2);
    if (bmi > 30 || bmi < 17) g.setColor(1, 0, 0);
    else if (bmi > 25 || bmi < 18.5) g.setColor(1, 1, 0);
    else if (bmi > 21 && bmi < 23) g.setColor(0, 1, 0);
    else g.setColor(1, 1, 1);

    // The line's vertices derive from multiplying the percentage
    // coordinates by the graph's dimensions (and adding the gaps)
    g.drawLine(
      L[k+1].x * R.w,
      L[k+1].y * graphHeight + offset + gap,
      L[k].x * R.w,
      L[k].y * graphHeight + offset + gap
    );
    g.drawCircle(L[k].x * R.w, L[k].y * graphHeight + offset + gap, 1);
    g.reset();
  }

  g // Displays weight and date edge values on the graph
   .setFont('4x6', 2).setFontAlign(0, 0)
   .drawString(top, R.w / 2, gap / 2 + offset)
   .drawString(bottom, R.w / 2, R.h - (gap / 2) + offset)
   .setFont('6x8').setFontAlign(0, 0, 90)
   .drawString(formatDt(L[L.length-1].date, '/'), 4, R.h / 2  + offset)
   .drawString(formatDt(L[0].date, '/'), R.w - 4, R.h / 2 + offset);

  // Enables returning with the back widget or button press
  Bangle.setUI({
    mode: "custom",
    back: () => {
      start();
    }
  });
}

// Streamline starting process
function start(){
  g.clear(reset);
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  E.showMenu(MainMenu);
}

// App start prompts for user height if it isn't set
if (Profile.height != null) {
  start();
} else {
  E.showMenu({
    '' : {
      title : 'Set height (cm)',
      back : () => { Bangle.showClock(); },
    },
    'Change height' : HeightMenu,
  });
}
