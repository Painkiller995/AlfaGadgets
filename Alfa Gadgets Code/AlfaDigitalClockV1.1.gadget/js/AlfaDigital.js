System.Gadget.settingsUI = "Settings.html";
System.Gadget.onSettingsClosed = settingsClose;

var timervar;
var refreshRate = 100; //update every 100 ms
var DefBackgroundColor = "rgb(66, 156, 227)";
var SwitchToBlack = "rgb(238, 238, 238)";
var BlackText = "rgb(56, 56, 56)";

////////////////////////////////

function init() {
  loadSettings();
  AlfaClock();
}

////////////////////////////////

function loadSettings() {
  var body = document.body;
  var text = document.getElementById("alfatimehere");
  var text2 = document.getElementById("datehere");
  var SelectedColor = System.Gadget.Settings.readString("background");
  if (SelectedColor == SwitchToBlack) {
    text.style.color = BlackText;
    text2.style.color = BlackText;
    DefBackgroundColor = SelectedColor;
    body.style.backgroundColor = DefBackgroundColor;
  } else {
    text.style.color = "white";
    text2.style.color = "white";
    DefBackgroundColor = SelectedColor;
    body.style.backgroundColor = DefBackgroundColor;
  }
}

////////////////////////////////

function settingsClose() {
  clearTimeout(timervar);
  loadSettings();
  AlfaClock();
}

////////////////////////////////

function AlfaClock() {
  var time = new Date();
  var hour = time.getHours();
  var minutes = time.getMinutes();
  var seconds = time.getSeconds();
  dHour = parseInt(hour);
  dMin = parseInt(minutes);
  dSec = parseInt(seconds);
  datehere.innerText = time.toDateString();
  var dtime = dHour + ":" + dMin + ":" + dSec;
  alfatimehere.innerText = dtime;

  timervar = setTimeout("AlfaClock()", refreshRate);
}
