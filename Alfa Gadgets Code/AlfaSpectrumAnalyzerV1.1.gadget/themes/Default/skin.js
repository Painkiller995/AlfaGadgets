var Alfabackground = "rgb(16, 16, 16)";
var AlfaPeakHeight = 2;
var AlfaPeakColor = "rgb(66, 156, 227)";
var barColor = "white";
var gWidth = 355; // gadget width
var gHeight = 200; // gadget height
var barWidth = 22.3; // width of the bar
var barHeight = 100; // the max height of the bars
var barspace = gHeight - barHeight;
var eqBars = new Array(EQbands);
var eqPeak = new Array(EQbands);
var peakTmr = new Array(EQbands);

var updating = false;
var scaledBarHeight = barHeight / 150;

function initialize() {
  var xPos, yPos;

  document.body.style.width = gWidth;
  document.body.style.height = gHeight;
  //document.body.style.background = Alfabackground;
  //create the EQ bar elements
  for (j = 0; j < EQbands; j++) {
    xPos = 5 + j * barWidth;
    yPos = 5;

    // EQ band itself
    divGraph.innerHTML +=
      "<div id='divEQpeak" +
      j +
      "' style='overflow:hidden; width:" +
      barWidth +
      "px; top:" +
      yPos +
      "px; " +
      "left:" +
      xPos +
      "px;'>" +
      "<div id='Peakn" +
      j +
      "' style=' background: " +
      AlfaPeakColor +
      " ; width:10px; ' ></div>  " +
      "></div>";

    // each peak hold
    divGraph.innerHTML +=
      "<div id='divEQband" +
      j +
      "' style='overflow:hidden; width:" +
      barWidth +
      "px; top:" +
      yPos +
      "px; " +
      "left:" +
      xPos +
      "px;'>" +
      "<div  id='Barn" +
      j +
      "' style=' background: " +
      barColor +
      "; width:10px; Height=300px' ></div><br> <img  id='imgEQband" +
      j +
      "' /></div>";
  }

  System.Gadget.background = skinPath + "/bar1_background.png";
}

function display() {
  if (updating) return;
  updating = true;

  var eqBarScale, eqPeakScale, obj;
  try {
    // quick test if work needed
    var nonZeroCount = 0;
    for (j = 0; j < EQbands; j++) {
      if (parseInt(scaledBarHeight * EQGadget.EQBand(j)) > 0) nonZeroCount++;
      if (eqPeak[j] > 0) nonZeroCount++;
    }
    if (nonZeroCount > 0) {
      if (decayRate == 0) {
        myDecayRate = 20;
        peakDelay = 16;
        peakDecayRate = 10;
      } else {
        myDecayRate = (decayRate + 1) * 2;
        if (myDecayRate > 16) myDecayRate = 16;
        peakDelay = (decayRate + 1) * 3 + 4;
        if (peakDelay > 16) peakDelay = 16;
        if (peakDelay < 4) peakDelay = 4;
        peakDecayRate = myDecayRate / 2;
      }

      // update the EQ
      for (j = 0; j < EQbands; j++) {
        eqBarScale = scaledBarHeight * EQGadget.EQBand(j);
        eqPeakScale = eqBarScale;

        if (eqBarScale > 0) {
          eqBarScale += 2;

          if (eqBarScale < barHeight / 4) eqBarScale *= 2;

          eqPeakScale = eqBarScale + 4;
        }

        if (eqPeakScale > barHeight) eqPeakScale = barHeight;

        if (eqBarScale > barHeight) eqBarScale = barHeight - 4;

        //decay the bars
        if (eqBarScale < eqBars[j] - myDecayRate)
          eqBarScale = eqBars[j] - myDecayRate;

        if (eqPeakScale < eqPeak[j] - peakDecayRate) {
          peakTmr[j]--;
          eqPeakScale = eqPeak[j] - peakDecayRate;
        } else {
          peakTmr[j] = peakDelay;
        }

        // update the display
        obj = document.getElementById("divEQband" + j);
        if (eqBarScale < 1) {
          // hide the bar if it's zero
          if (eqBars[j] > 0) obj.style.display = "none";
        } else {
          // display the bar if it's hidden
          if (eqBars[j] < 1) obj.style.display = "inline";

          // update the bar height
          var tHeight = barHeight - eqBarScale;
          obj.style.height = eqBarScale;
          obj.style.top = barspace + tHeight + 1;
          obj = document.getElementById("imgEQband" + j);
          obj.style.top = -tHeight;
        }
        eqBars[j] = eqBarScale;

        if (peakTmr[j] < 0 || peakTmr[j] == peakDelay) {
          obj = document.getElementById("divEQpeak" + j);
          if (eqPeakScale < 1) {
            // hide the bar if it's zero
            if (eqPeak[j] > 0) obj.style.display = "none";
          } else {
            // display the bar if it's hidden
            if (eqPeak[j] < 1) obj.style.display = "inline";

            // update the bar height
            var tHeight = barHeight - eqPeakScale;
            obj.style.height = AlfaPeakHeight;
            obj.style.top = 5 + barspace + tHeight;
          }
          eqPeak[j] = eqPeakScale;
        }
      }
    }
  } catch (err) {
    debugLog("display: " + err.name + " - " + err.message);
  }

  updating = false;
}
