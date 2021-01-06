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

var maxBrightnessLevels = 0;
var curBrightnessLevel = 0;

function onload() {
  loadSettings();

  //create array of brightness levels
  var BrightnessLevelsString = GetBrightnessLevels();
  var BrightnessLevels = BrightnessLevelsString.split("|");

  maxBrightnessLevels = BrightnessLevels.length - 2; //last entry is empty and is ZERO-BASED

  var scaleRatio = 100 / BrightnessLevels[maxBrightnessLevels];

  //create progress bar segments for different brightness levels
  //create in reverse so the segments are created in the right stack order
  for (var i = maxBrightnessLevels; i >= 0; i--) {
    var wid = 0;
    var elem = document.createElement("a");
    elem.id = "brightness-level-bar-item-" + i;
    elem.className = "BrightnessLevelBarItem";
    //scale brightness levels to 100px (as some displays have max values below 100)
    //assume that no brightness levels exist above 100.
    wid = Math.round(scaleRatio * BrightnessLevels[i] * 3);
    elem.style.width = wid + "px"; //make width equal to brightness value
    elem.innerHTML = "&nbsp;";
    elem.brightnessLevel = BrightnessLevels[i]; //expando attribute to store brightness value

    elem.onclick = function () {
      SetCurrentBrightnessStart(this.brightnessLevel);
    };
    elem.onmouseover = function () {
      turnOnUpToItem(this.brightnessLevel);
    };
    elem.onmouseout = function () {
      RevertItemsToNormal();
    };
    document.getElementById("BrightnessLevelsBar").appendChild(elem);
  }

  //add value display container element
  var elem = document.createElement("div");
  elem.id = "BrightnessLevelBarValueContainer";

  //add value display icon element
  var elem2 = document.createElement("div");
  elem2.id = "BrightnessLevelBarValueIcon";
  //elem2.src = "icon.png";
  elem.appendChild(elem2);

  //add value display element
  elem2 = document.createElement("div");
  elem2.id = "BrightnessLevelBarValue";
  elem.appendChild(elem2);

  document.getElementById("BrightnessLevelsBar").appendChild(elem);

  //initialise values and brightness level bar
  CheckCurrentBrightnessLevel();

  //RevertItemsToNormal();

  //activate timer to check brightness level every minute and update (e.g. changed outside of gadget)
  window.setInterval(function () {
    CheckCurrentBrightnessLevel();
  }, 60000);
}

//wrapper function called when brightness level to be changed
function SetCurrentBrightnessStart(brightnessLevel) {
  //enable brightness changing icon
  var elem = document.getElementById("BrightnessLevelBarValueIcon");
  //    elem.src = "brightness-icon-changing.png";

  SetCurrentBrightness(brightnessLevel);
  CheckCurrentBrightnessLevel();

  //revert brightness icon
  //elem.src = "brightness-icon.png";
}

//called when brightness level segment hovered over to activate display
function turnOnUpToItem(brightnessLevel) {
  //loop through all the brightness bar segments
  for (var i = 0; i <= maxBrightnessLevels; i++) {
    var elem = document.getElementById("brightness-level-bar-item-" + i);

    //if above hovered brightness level...
    if (parseInt(elem.brightnessLevel) > parseInt(brightnessLevel)) {
      //reset to no background image
      //elem.style.background = "blue";
    } else {
      //set to selected bg image
      //elem.style.background = "red";
    }
  }

  //update display value
  document.getElementById(
    "BrightnessLevelBarValue"
  ).innerText = brightnessLevel;
}

//called when brightness level segment is moused out; reverts bar
function RevertItemsToNormal() {
  //loop through all the brightness bar segments
  for (var i = 0; i <= maxBrightnessLevels; i++) {
    var elem = document.getElementById("brightness-level-bar-item-" + i);

    //if above current brightness level...
    if (parseInt(elem.brightnessLevel) > parseInt(curBrightnessLevel)) {
      //reset to no background image
      //elem.style.background= "blue";
    } else {
      //set to selected bg image
      // elem.style.background  = "red";
    }
  }

  //update display value
  document.getElementById(
    "BrightnessLevelBarValue"
  ).innerText = curBrightnessLevel;
}

//called regularly to check if brightness level has changed, and if so, update
function CheckCurrentBrightnessLevel() {
  loadSettings();

  curBrightnessLevel = GetCurrentBrightness();

  // send value to divvol :-)

  var divvolb = document.getElementById("divvol");
  divvolb.style.width = Math.round(curBrightnessLevel * 3);

  var brightnessLevelFound = false;

  //loop through all the brightness bar segments
  for (var i = 0; i <= maxBrightnessLevels; i++) {
    var elem = document.getElementById("brightness-level-bar-item-" + i);

    //if brightness level segment is above or equal to current brightness level, and none found yet...
    if (
      parseInt(elem.brightnessLevel) >= parseInt(curBrightnessLevel) &&
      brightnessLevelFound == false
    ) {
      //set currently active brightness level bg position (to show current position)
      elem.style.backgroundPosition = "top right";

      //set flag so only the correct brightness bar segment is set
      brightnessLevelFound = true;
    } else {
      //reset to normal bg position
      elem.style.backgroundPosition = "top left";
    }
  }

  RevertItemsToNormal();
}

function loadSettings() {
  var body = document.body;
  var text = document.getElementById("BrightnessLevelBarValue");
  var text2 = document.getElementById("label");
  var SelectedColor = System.Gadget.Settings.readString("background");
  try {
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
  } catch (e) {}

  try {
    var divv = document.getElementById("divvol");
    var barc = System.Gadget.Settings.readString("barcolor");

    if (barc.substring(0, 3) == "rgb") {
      divv.style.background = barc;
    } else {
      console.log("Wrong val");
    }
  } catch (e) {}
}

function onSettingsClosed() {
  loadSettings();
}
