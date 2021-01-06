var pos = 0;
var len = 180;
var maxh = 190;
var oldusage = 0;
var u1 = 0;
var u2 = 0;
var u3 = 0;
var uc = 0;
var timeout = 250;
var prevm = 0;
var ncore = 0;
var prevncore = 0;
var prevcaption = "1";
var dbg = "";
var spancolor = "rgb(66, 156, 227)"; //def

//////////////////////////////////////////////////
var DefBackgroundColor = "rgb(66, 156, 227)";
var SwitchToBlack = "rgb(238, 238, 238)";
var BlackText = "rgb(56, 56, 56)";
/////////////////////////////////////////////////

function TimeEvent() {
  try {
    TimeProc();
  } catch (e) {
    header.innerHTML =
      "Error: " + e.name + " " + e.message + " pos=" + pos + " " + dbg;
  }
  timerID = setTimeout("TimeEvent()", timeout);
}

function TimeProc() {
  usage = 0; //Math.random()*100;
  try {
    var ncount = System.Machine.CPUs.count;
    var totalram = System.Machine.totalMemory;
    var availableram = System.Machine.availableMemory;
    var availableramGB = availableram / 1024;
    var usedramGB = (totalram - availableram) / 1024;
    var ramfree = parseInt((availableram / totalram) * 100);
    var ramusage = parseInt(100 - ramfree);
    if (ncore == 0 || ncore > ncount) {
      usage = 0.0;
      for (i = 0; i < ncount; i++) {
        var upc = System.Machine.CPUs.item(i).usagePercentage;
        if (upc > 0) usage += upc;
      }
      usage /= ncount;
    } else {
      usage = System.Machine.CPUs.item(ncore - 1).usagePercentage;
      if (usage < 0) usage = 0;
    }
  } catch (e) {}
  if (uc == 0) {
    uc++;
    u1 = usage;
  } else if (uc == 1) {
    uc++;
    u2 = usage;
  } else if (uc == 2) {
    uc++;
    u3 = usage;
  } else {
    uc = 0;
    var usage = (u1 + u2 + u3 + usage) / 4;
    var currentusage = usage;

    var m = Math.round(((usage + oldusage) * maxh) / 2 / 100, 0);
    var currentm = m;
    if (m == prevm) if (m >= 1 && m < maxh) m = m - 1;

    cpuusage.innerHTML = "CPU Utilisation : " + parseInt(currentusage) + "%";
    ramus.innerHTML =
      "RAM Utilisation : " +
      parseInt(ramusage) +
      "% , " +
      usedramGB.toFixed(1) +
      " GB";
    ramavailable.innerHTML =
      "Available Memory : " +
      parseInt(ramfree) +
      "% , " +
      availableramGB.toFixed(1) +
      " GB";
    if (pos < len) {
      var o = document.getElementById("s" + (pos + 1 + len));
      o.style.height = m;
      o.style.background = spancolor;
      document.getElementById("s" + (pos + 1)).style.display = "none";
      o.style.display = "";

      pos++;
    } else {
      try {
        for (var i = 1; i <= len; i++) {
          o = document.getElementById("s" + i);
          if (i == len) {
            o.style.height = m;
            o.style.background = spancolor;
          } else {
            o.style.height = document.getElementById(
              "s" + (i + len + 1)
            ).style.height;
            o.style.background = spancolor;
          }
          o.style.display = "";
        }

        for (var i = 1; i <= len; i++)
          document.getElementById("s" + (i + len)).style.display = "none";

        pos = 0;
      } catch (e) {}
    }
    oldusage = currentusage;
    prevm = currentm;
    Load_Settings();
  }
}

function SetHeader() {
  try {
    cpu = System.Machine.CPUs.item(0).name;
    cpu = cpu.replace(/\(tm\)/g, "").replace(/\(TM\)/g, ""); //clean name
    cpu = cpu.replace(/Mobile Technology/g, "").replace(/Mobile/g, "");
    cpu = cpu
      .replace(/Processor/g, "")
      .replace(/processor/g, "")
      .replace(/CPU/g, "");
    cpu = cpu
      .replace(/\(R\)/g, " ")
      .replace(/X2 Dual Core/g, "X2")
      .replace(/Duo/g, "");
    cpu = cpu.replace(/Genuine /g, "").replace(/.00GHz/g, "GHz");

    cpu = cpu.replace(/  /g, " ").replace(/  /g, " ");
    if (ncore > 0 && System.Machine.CPUs.count > 1) cpu += " #" + ncore;
    header.innerHTML = "CPU: " + cpu;
    prevncore = ncore;
  } catch (e) {}
}

function Initialize() {
  try {
    System.Gadget.settingsUI = "options.html";
    System.Gadget.settingsUI = "options.html";
  } catch (e) {}
  prevncore = -1; // force header refresh
  Load_Settings();
}

function Load_Settings() {
  try {
    speedcfg = System.Gadget.Settings.readString("speed");
    if (speedcfg) timeout = parseInt(speedcfg) / 4;
    caption = System.Gadget.Settings.readString("caption");
    if (caption)
      if (prevcaption != caption) {
        if (caption == "0") header.style.display = "none";
        else header.style.display = "";
        prevcaption = caption;
      }
    corecfg = System.Gadget.Settings.readString("core");
    if (corecfg) ncore = parseInt(corecfg);
    if (prevncore != ncore) SetHeader();
  } catch (e) {}

  try {
    var body = document.body;
    var text = document.getElementById("header");
    var text2 = document.getElementById("cpuusage");
    var SelectedColor = System.Gadget.Settings.readString("background");

    if (SelectedColor == SwitchToBlack) {
      text.style.color = BlackText;
      text2.style.color = BlackText;
      ramus.style.color = BlackText;
      ramavailable.style.color = BlackText;
      DefBackgroundColor = SelectedColor;
      body.style.backgroundColor = DefBackgroundColor;
    } else {
      text.style.color = "white";
      text2.style.color = "white";
      ramus.style.color = "white";
      ramavailable.style.color = "white";
      DefBackgroundColor = SelectedColor;
      body.style.backgroundColor = DefBackgroundColor;
    }
  } catch (e) {}

  try {
    var sapc = System.Gadget.Settings.readString("graph");

    if (sapc.substring(0, 3) == "rgb") {
      spancolor = sapc;
    } else {
      console.log("Wrong val");
    }
  } catch (e) {}
}
