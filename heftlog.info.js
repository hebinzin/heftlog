/*
 * Run this code at the Espruino Web IDE to generate the `nestor.info`
 * file in the Bangle.js storage
 */
require("Storage").write("heftlog.info",{
  "id":"heftlog",
  "name":"Heft Log",
  "type":"app",
  "src":"heftlog.app.js",
  "icon":"heftlog.img",
  "version":"0.1",
  "tags":"tool,health",
  "files":"heftlog.info,heftlog.app.js",
  "data":"heftlog.json"
});
