//////////////////////////////////////////////////
var DefBackgroundColor = "rgb(16,16,16)";
var DefPeakColor = "red";
var DefBarColor = "red";
var SwitchToBlack = "rgb(238, 238, 238)";
var BlackText = "rgb(56, 56, 56)";
/////////////////////////////////////////////////

var refreshRate = 30; // how often to refresh
var decayRate = 4; // decay the bars
var volGain = 1.0; // volume gain
var EQbands = 16; // number of EQ bands (currently fixed)

var tRefresh;
var currentScale;
var gadgetPath = System.Gadget.path;
var charbackslash = new RegExp("\\\\", "g");

var oShell = new ActiveXObject("WScript.Shell");
var oFSO = new ActiveXObject("Scripting.FileSystemObject");

System.Gadget.settingsUI = "Settings.html";
System.Gadget.visibilityChanged = setupTimers;
System.Gadget.onDock = fixFocus;
System.Gadget.onUndock = fixFocus;
System.Gadget.onSettingsClosed = fixFocus;

var bDebug = oFSO.FileExists(gadgetPath + "\\debug.txt");
try {
  if (bDebug)
    var debugLogFile = oFSO.OpenTextFile(gadgetPath + "\\debug.txt", 2);
} catch (err) {
  bDebug = false;
  debugLog("Open debug.txt error: " + err.name + " - " + err.message);
}

var EQGadget, regRoot;

//register ActiveX component
var axDllClass = "WASAPIlib.WASAPImain";
var axDllCLSID = "{A075E99F-F9E9-4904-A52A-FC812D7FB86E}";
var axDllTypeLib = "{653AD70C-4824-4B35-8A81-680C47DAB9DF}";
var axDllFilename = "WASAPIlib.dll";
var axDllPath =
  System.Gadget.path +
  "\\WASAPI\\" +
  System.Environment.getEnvironmentVariable("PROCESSOR_ARCHITECTURE");
var axProcArc =
  System.Environment.getEnvironmentVariable("PROCESSOR_ARCHITECTURE") == "x86"
    ? "win32"
    : "win64";
//is there a debug version of the DLL present?
if (bDebug && oFSO.FileExists(axDllPath + "\\debug\\" + axDllFilename))
  axDllPath = axDllPath + "\\debug";

if (bDebug) debugLog("Platform: " + axDllPath);

if (bDebug) debugLog("Register ActiveX");
if (bDebug) debugLog("  trying HKLM");
if (!activeDLL("HKLM")) {
  if (bDebug) debugLog("  trying HKCU");
  if (!activeDLL("HKCU")) debugLog("Error creating ActiveX object");
}

function startUpGadget() {
  try {
    initialize();
    initEQ();
  } catch (err) {
    debugLog("initialize: " + err.name + " - " + err.message);
  }
}

function initEQ() {
  try {
    //read the settings
    if (System.Gadget.Settings.readString("background") != "")
      DefBackgroundColor = System.Gadget.Settings.read("background");
    if (System.Gadget.Settings.readString("peak") != "")
      DefPeakColor = System.Gadget.Settings.read("peak");
    if (System.Gadget.Settings.readString("bar") != "")
      DefBarColor = System.Gadget.Settings.read("bar");
    if (System.Gadget.Settings.readString("RefreshRate") != "")
      refreshRate = System.Gadget.Settings.read("RefreshRate");
    if (System.Gadget.Settings.readString("decayRate") != "")
      decayRate = System.Gadget.Settings.read("decayRate");
    if (System.Gadget.Settings.readString("volGain") != "") {
      volGain = parseFloat(System.Gadget.Settings.readString("volGain"));

      if (volGain < 0.2 || volGain > 2.0) volGain = 1.0;
    }

    //setup the update timer
    setupTimers();
  } catch (err) {
    debugLog("initEQ: " + err.name + " - " + err.message);
  }
}

// Setup the update Timer
function setupTimers() {
  //quit if the DLL didn't initialise
  if (EQGadget == null) return;

  //clear timers
  try {
    window.clearTimeout(tRefresh);
  } catch (err) {}

  //create change timer
  if (System.Gadget.visible) {
    if (bDebug) debugLog("Init WASAPI");
    try {
      var err = EQGadget.startCapture();

      if (bDebug) {
        debugLog("WASAPI cbSize:" + EQGadget.WFcbSize);
        debugLog("WASAPI AvgBytesPerSec:" + EQGadget.WFnAvgBytesPerSec);
        debugLog("WASAPI BlockAlign:" + EQGadget.WFnBlockAlign);
        debugLog("WASAPI Channels:" + EQGadget.WFnChannels);
        debugLog("WASAPI SamplesPerSec:" + EQGadget.WFnSamplesPerSec);
        debugLog("WASAPI BitsPerSample:" + EQGadget.WFwBitsPerSample);
        debugLog("WASAPI ValidBitsPerSample:" + EQGadget.WFwValidBitsPerSample);
        debugLog("WASAPI FormatTag:" + EQGadget.WFwFormatTag);
      }

      tRefresh = window.setInterval(updateDisplay, refreshRate);
      if (bDebug) debugLog("Start timer");
    } catch (err) {
      // The soundcard has possibly been reset, clear the timer and try getting it back in 1 sec
      if (bDebug) debugLog("Soundcard unavailable");
      try {
        EQGadget.stopCapture();
      } catch (err) {}

      window.setTimeout(setupTimers, 1000);
    }

    fixFocus();
  } else {
    if (bDebug) debugLog("Stop timer (not visible)");
    try {
      EQGadget.stopCapture();
    } catch (err) {
      debugLog("WASAPI stopCapture error");
    }
  }
}

// perform the FFT and update the display
function updateDisplay() {
  try {
    EQGadget.FFT(EQbands, volGain);
  } catch (err) {
    // The soundcard has possibly been reset, clear the timer and try getting it back in 1 sec
    try {
      window.clearTimeout(tRefresh);
    } catch (err) {}

    try {
      EQGadget.stopCapture();
    } catch (err) {}
    window.setTimeout(setupTimers, 1000);
  }

  try {
    display();
  } catch (err) {}
}

// terminate the DLL and unregister it
function terminate() {
  if (bDebug) debugLog("Spectrum Analyser: Shutting down gracefully");
  //clear timers
  try {
    window.clearTimeout(tRefresh);
  } catch (err) {}

  try {
    EQGadget.stopCapture();
  } catch (err) {
    debugLog("WASAPI stopCapture: " + err.name + " - " + err.message);
  }

  EQGadget = null;

  unregisterDLL();
  if (bDebug) debugLog("Spectrum Analyser: Shut down gracefully");
}

// Register DLL
function registerDLL() {
  var classRoot = regRoot + "\\Software\\Classes\\" + axDllClass + "\\";
  var classRoot2 = regRoot + "\\Software\\Classes\\" + axDllClass + ".1\\";
  var clsidRoot = regRoot + "\\Software\\Classes\\CLSID\\" + axDllCLSID + "\\";
  var typelibRoot =
    regRoot + "\\Software\\Classes\\TypeLib\\" + axDllTypeLib + "\\";
  var dllPath = axDllPath + "\\" + axDllFilename;

  oShell.RegWrite(classRoot + "CLSID\\", axDllCLSID, "REG_SZ");
  oShell.RegWrite(classRoot + "CurVer\\", axDllClass + ".1", "REG_SZ");
  oShell.RegWrite(classRoot2 + "CLSID\\", axDllCLSID, "REG_SZ");

  oShell.RegWrite(clsidRoot + "InprocServer32\\", dllPath, "REG_SZ");
  oShell.RegWrite(
    clsidRoot + "InprocServer32\\ThreadingModel",
    "Apartment",
    "REG_SZ"
  );
  oShell.RegWrite(clsidRoot + "ProgId\\", axDllClass + ".1", "REG_SZ");
  oShell.RegWrite(clsidRoot + "TypeLib\\", axDllTypeLib, "REG_SZ");
  oShell.RegWrite(
    clsidRoot + "VersionIndependentProgID\\",
    axDllClass,
    "REG_SZ"
  );

  oShell.RegWrite(typelibRoot + "1.0\\0\\", "", "REG_SZ");
  oShell.RegWrite(
    typelibRoot + "1.0\\0\\" + axProcArc + "\\",
    dllPath,
    "REG_SZ"
  );
  oShell.RegWrite(typelibRoot + "1.0\\FLAGS\\", "0", "REG_SZ");
  oShell.RegWrite(typelibRoot + "1.0\\HELPDIR\\", axDllPath, "REG_SZ");
}

// Unregister DLL
function unregisterDLL() {
  try {
    var classRoot = regRoot + "\\Software\\Classes\\" + axDllClass + "\\";
    var classRoot2 = regRoot + "\\Software\\Classes\\" + axDllClass + ".1\\";
    var clsidRoot =
      regRoot + "\\Software\\Classes\\CLSID\\" + axDllCLSID + "\\";
    var typelibRoot =
      regRoot + "\\Software\\Classes\\TypeLib\\" + axDllTypeLib + "\\";

    oShell.RegDelete(typelibRoot + "1.0\\0\\" + axProcArc + "\\");
    oShell.RegDelete(typelibRoot + "1.0\\0\\");
    oShell.RegDelete(typelibRoot + "1.0\\FLAGS\\");
    oShell.RegDelete(typelibRoot + "1.0\\HELPDIR\\");
    oShell.RegDelete(typelibRoot + "1.0\\");
    oShell.RegDelete(typelibRoot);
    oShell.RegDelete(clsidRoot + "VersionIndependentProgID\\");
    oShell.RegDelete(clsidRoot + "TypeLib\\");
    oShell.RegDelete(clsidRoot + "ProgId\\");
    oShell.RegDelete(clsidRoot + "InprocServer32\\");
    oShell.RegDelete(clsidRoot);
    oShell.RegDelete(classRoot + "CurVer\\");
    oShell.RegDelete(classRoot + "CLSID\\");
    oShell.RegDelete(classRoot);
    oShell.RegDelete(classRoot2 + "CLSID\\");
    oShell.RegDelete(classRoot2);
  } catch (err) {
    debugLog("unregisterDLL: " + err.name + " - " + err.message);
  }
}

// Try to register the DLL
function activeDLL(root) {
  regRoot = root;

  try {
    registerDLL();
    EQGadget = new ActiveXObject(axDllClass);
    return true;
  } catch (err) {
    EQGadget = null;
    unregisterDLL();
    return false;
  }

  return false;
}

//log a debug entry
function debugLog(str) {
  try {
    System.Debug.outputString(str);
    if (bDebug) debugLogFile.WriteLine(str);
  } catch (err) {}
}

// WORKAROUND for Bug#40
//
function fixFocus() {
  loadSettings();
  window.setTimeout(fixFocus2, 300);
}
function fixFocus2() {
  self.focus();
}

//window.setInterval(checkBug40, 300);
var scrX, scrY;
function checkBug40() {
  var newY = window.screenTop;
  var newX = window.screenLeft;
  if (newY != scrY || newX != scrX) {
    fixFocus2();
    scrX = newX;
    scrY = newY;
  }
}

function loadSettings() {
  var body = document.body;
  var SelectedColor = System.Gadget.Settings.readString("background");
  var barColor = System.Gadget.Settings.readString("bar");
  var peakColor = System.Gadget.Settings.readString("peak");

  try {
    if (SelectedColor == SwitchToBlack) {
      for (i = 0; i <= 20; i++) {
        try {
          var Peakc = document.getElementById("Peakn" + i);
          var Barc = document.getElementById("Barn" + i);
          Peakc.style.backgroundColor = "black";
          Barc.style.background = "rgb(56, 56, 56)";
        } catch (e) {}
      }
      DefBackgroundColor = SelectedColor;
      body.style.backgroundColor = DefBackgroundColor;
    } else if (System.Gadget.Settings.readString("background") != "") {
      for (i = 0; i <= 20; i++) {
        try {
          var Peakc = document.getElementById("Peakn" + i);
          var Barc = document.getElementById("Barn" + i);
          Peakc.style.backgroundColor = "gray";
          Barc.style.background = "white";
        } catch (e) {}
      }
      DefBackgroundColor = SelectedColor;
      body.style.backgroundColor = DefBackgroundColor;
    } else {
      body.style.backgroundColor = DefBackgroundColor;
    }
  } catch (e) {}

  if (peakColor != "") {
    for (i = 0; i <= 20; i++) {
      try {
        var Peakcc = document.getElementById("Peakn" + i);

        Peakcc.style.backgroundColor = peakColor;
      } catch (e) {}
    }
  }

  if (barColor != "") {
    for (i = 0; i <= 20; i++) {
      try {
        var barcc = document.getElementById("Barn" + i);

        barcc.style.backgroundColor = barColor;
      } catch (e) {}
    }
  }
}
