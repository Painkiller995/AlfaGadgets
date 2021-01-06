//Alfa Volume Control gadget created and developed by fahd daher
//Email: fahddaher995@gmail.com
//All Rights Reserved Copyright © 2020

System.Gadget.settingsUI = "settings.html";
System.Gadget.onSettingsClosed = onSettingsClosed;

//////////////////////////////////////////////////
var DefBackgroundColor = "rgb(66, 156, 227)";
var SwitchToBlack = "rgb(238, 238, 238)";
var BlackText = "rgb(56, 56, 56)";
/////////////////////////////////////////////////

var timeout = 3000;
var barcolor = "rgb(66, 156, 227)";
function init() {
  loadSettings();
  update();
}

function loadSettings() {
  var body = document.body;
  var text = document.getElementById("txtVolume");
  var text2 = document.getElementById("label");
  var text3 = document.getElementById("ssid");
  var text4 = document.getElementById("ip");

  var SelectedColor = System.Gadget.Settings.readString("background");
  try {
    if (SelectedColor == SwitchToBlack) {
      text.style.color = BlackText;
      text2.style.color = BlackText;
      text3.style.color = BlackText;
      text4.style.color = BlackText;
      DefBackgroundColor = SelectedColor;
      body.style.backgroundColor = DefBackgroundColor;
    } else {
      text.style.color = "white";
      text2.style.color = "white";
      text3.style.color = "white";
      text4.style.color = "white";
      DefBackgroundColor = SelectedColor;
      body.style.backgroundColor = DefBackgroundColor;
    }
  } catch (e) {}

  try {
    var barc = System.Gadget.Settings.readString("barcolor");

    if (barc.substring(0, 3) == "rgb") {
      barcolor = barc;
    } else {
      console.log("Wrong val");
    }
  } catch (e) {}
}

function onSettingsClosed() {
  loadSettings();
}

function verifyUsage(usage) {
  if (usage == null) return "0";

  if (usage <= 0) return "0";

  if (usage > 100) return "100";

  return usage;
}

function update() {
  theUsage = verifyUsage(System.Network.Wireless.signalStrength);
  txtVolume.innerText = verifyUsage(theUsage) + "%";
  ssid.innerText = System.Network.Wireless.ssid;
  divvol.style.width = theUsage * 3;
  divvol.style.background = barcolor;
  ip.innerText = "IP Address: " + System.Network.Wireless.address;
  setTimeout("update()", timeout);
}
