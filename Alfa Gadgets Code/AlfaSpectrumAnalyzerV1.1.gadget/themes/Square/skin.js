var Alfabackground = "rgb(16, 16, 16)";
var gWidth = 355; // gadget width
var gHeight = 355; // gadget height
var barSize = gWidth / 4; // width of the bar
var maxValue = 256;
var eqBars = new Array(EQbands);

var updating = false;

function initialize() {
  var xPos, yPos;

  //System.Gadget.background = "images/blank.png";
  document.body.style.width = gWidth;
  document.body.style.height = gHeight;
  document.body.style.background = Alfabackground;

  //create the EQ bar elements
  for (j = 0; j < EQbands; j++) {
    xPos = (j * barSize) % gWidth;
    yPos = Math.floor((j * barSize) / gWidth) * barSize;

    // EQ band itself
    divGraph.innerHTML +=
      "<div id='divEQband" +
      j +
      "' style='background-color:rgb(0,0,0); width:" +
      barSize +
      "px; height:" +
      barSize +
      "px; top:" +
      yPos +
      "px; left:" +
      xPos +
      "px;'></div>";
  }
}

function display() {
  if (updating) return;
  updating = true;

  var eqScale, obj, cRed, cGreen;
  try {
    // update the EQ
    for (j = 0; j < EQbands; j++) {
      eqScale = EQGadget.EQBand(j) * 3;
      if (eqScale > maxValue) eqScale = maxValue;

      //decay the bars
      if (decayRate > 0) {
        if (eqScale < eqBars[j])
          if (eqBars[j] - decayRate > eqScale) eqScale = eqBars[j] - decayRate;
      }

      obj = document.getElementById("divEQband" + j);
      if (eqScale < 1) {
        obj.style.backgroundColor = "rgb(0,0,0)";
      } else {
        if (eqScale < 100) {
          cRed = 0;
          cGreen = eqScale * 2;
        } else if (eqScale < 200) {
          cRed = eqScale;
          cGreen = eqScale;
        } else {
          cRed = eqScale;
          cGreen = 0;
        }
        // update the bar colour
        obj.style.backgroundColor = "rgb(" + cRed + ", " + cGreen + ", 0)";
      }
      eqBars[j] = eqScale;
    }
  } catch (err) {
    debugLog("display: " + err.name + " - " + err.message);
  }

  updating = false;
}
